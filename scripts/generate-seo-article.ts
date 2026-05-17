#!/usr/bin/env tsx
/**
 * Expand a scaffolded SEO article into a full draft.
 *
 * Reads content/seo/<slug>.md, sends the frontmatter + outline to Claude
 * along with a regulatory-content style guide, and writes the returned
 * markdown body back into the file. Flips `draft: true` to `draft: false`
 * on success so the /guides route starts rendering it.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=...
 *   pnpm tsx scripts/generate-seo-article.ts <slug>
 *   pnpm tsx scripts/generate-seo-article.ts <slug> --dry-run
 *   pnpm tsx scripts/generate-seo-article.ts --all   # expand every draft
 *
 * Notes:
 *  - Model: claude-sonnet-4-6 with adaptive thinking.
 *  - The style guide is cached (cache_control: ephemeral). Re-running this
 *    script across multiple slugs in the same 5-minute window pays the
 *    cache-write premium once and reads at ~10% cost for every subsequent
 *    slug.
 *  - This is a DRAFTING tool, not a publishing tool. Every generated
 *    article still needs a human editorial pass before it goes live —
 *    regulatory accuracy is non-negotiable and Claude can get details
 *    subtly wrong.
 */

import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

import {
  articleFilePath,
  listArticleSlugs,
  loadArticle,
} from '../src/lib/seo/articles';
import { parseFrontmatter, stringifyArticle } from '../src/lib/seo/frontmatter';
import type { SeoArticle } from '../src/lib/seo/types';

const MODEL = 'claude-sonnet-4-6';

const STYLE_GUIDE = `
You are drafting a long-form SEO article for TankGuard, a compliance-tracking
SaaS for owners and operators of underground storage tanks (USTs). The article
will publish at https://tankguard.com/guides/<slug>. The reader is typically
a store owner or facility manager with 1–20 fueling sites who is trying to
understand a specific state-level compliance requirement.

STYLE
-----
- 900–1,400 words of markdown. No HTML.
- Start with a short (2–3 sentence) summary paragraph. No H1 — the template
  renders it from the frontmatter.
- Structure the rest with H2 (## ) sections. Use H3 (### ) sparingly. Do not
  use H4 or deeper.
- Write in plain English at roughly an 8th-grade reading level. Short
  sentences. No corporate voice, no hype.
- Always cite the specific regulatory citation (e.g. "40 CFR 280.33",
  "Chapter 62-761, F.A.C.", "30 TAC Chapter 334", "6 NYCRR Part 613") when
  a rule is mentioned. Put the citation in the sentence, not a footnote.
- If a deadline is recurring, say so and say the cadence ("once every 36
  months", "by March 1 each year"). If it's one-time, say that too.
- If the rule applies to a specific tank equipment type (single-wall vs
  double-wall, pressurized vs suction, Class B operator vs Class A), be
  explicit about which.
- Avoid phrases like "simply", "easily", "of course". Compliance is hard;
  don't pretend otherwise.

ACCURACY RULES (non-negotiable)
------------------------------
- If you are not sure a fact is current or correct, write "check with your
  state implementing agency" rather than fabricate it. It is better to be
  vague than wrong.
- Never invent agency names, phone numbers, forms, or URLs. If you don't
  know the specific form number, describe what the form does.
- Do not give dollar amounts for penalties unless they are in the 40 CFR
  Part 280 ranges or you are citing a well-known statutory cap (e.g.
  "up to $25,000 per day per violation" for federal UST violations). When
  in doubt, say "penalties can reach the statutory cap" without a number.
- Do not promise regulatory outcomes. TankGuard is a tracking tool, not a
  compliance guarantee. The closing CTA block in the template handles the
  product positioning; the article body should stay factual.

SECTION OUTLINE (suggested)
---------------------------
Use these as H2 sections unless the specific topic calls for a different
shape:

1. "What the rule says" — plain-English summary with the citation.
2. "Who this applies to" — tank types, facility types, ownership.
3. "What you have to do" — numbered list of concrete steps.
4. "What the inspector will look for" — documentation checklist.
5. "Common mistakes" — 3–5 bulleted pitfalls.
6. "How TankGuard handles this" — one short paragraph, no hard sell.

FORMAT
------
Return ONLY the article markdown body. Do not include frontmatter, an H1,
or surrounding commentary. Do not wrap the response in a code fence.
`.trim();

interface Options {
  slug?: string;
  all: boolean;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { all: false, dryRun: false };
  for (const a of argv) {
    if (a === '--all') opts.all = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: tsx scripts/generate-seo-article.ts <slug> [--dry-run] | --all [--dry-run]',
      );
      process.exit(0);
    } else if (!a.startsWith('--')) {
      opts.slug = a;
    }
  }
  return opts;
}

function buildUserPrompt(article: SeoArticle): string {
  const { frontmatter, body } = article;
  return `
State: ${frontmatter.state}
Target keyword: ${frontmatter.keyword}
Article title: ${frontmatter.title}
Slug: ${frontmatter.slug}

Existing scaffold (for the outline; ignore any HTML comments):
${body.trim()}

Write the full article body per the style guide.
`.trim();
}

async function expandArticle(
  client: Anthropic,
  slug: string,
  dryRun: boolean,
): Promise<void> {
  const article = loadArticle(slug);
  if (!article) {
    throw new Error(`No article found at content/seo/${slug}.md`);
  }
  if (!article.frontmatter.draft) {
    console.log(`[${slug}] already published (draft=false). Skipping.`);
    return;
  }

  console.log(`[${slug}] requesting expansion from ${MODEL}…`);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8_000,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: STYLE_GUIDE,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(article),
      },
    ],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  );
  if (!textBlock) {
    throw new Error(
      `[${slug}] Claude returned no text block. Stop reason: ${response.stop_reason}`,
    );
  }

  const markdown = textBlock.text.trim();
  if (markdown.length < 500) {
    throw new Error(
      `[${slug}] Generated article too short (${markdown.length} chars); refusing to overwrite scaffold.`,
    );
  }

  const cacheRead = response.usage.cache_read_input_tokens ?? 0;
  const cacheWrite = response.usage.cache_creation_input_tokens ?? 0;
  console.log(
    `[${slug}] ${response.usage.input_tokens} in + ${response.usage.output_tokens} out tokens ` +
      `(cache read=${cacheRead}, write=${cacheWrite})`,
  );

  if (dryRun) {
    console.log(`--- DRY RUN OUTPUT FOR ${slug} ---`);
    console.log(markdown);
    console.log(`--- END DRY RUN ---`);
    return;
  }

  const updated: SeoArticle = {
    frontmatter: { ...article.frontmatter, draft: false },
    body: markdown,
  };

  const filePath = articleFilePath(slug);
  fs.writeFileSync(filePath, stringifyArticle(updated), 'utf8');
  console.log(`[${slug}] wrote ${path.relative(process.cwd(), filePath)}`);
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      'ANTHROPIC_API_KEY is not set. Export it before running this script.',
    );
    process.exit(1);
  }

  const client = new Anthropic();

  let slugs: string[];
  if (opts.all) {
    slugs = listArticleSlugs().filter((s) => {
      const a = loadArticle(s);
      return Boolean(a?.frontmatter.draft);
    });
    console.log(`Found ${slugs.length} draft article(s) to expand.`);
  } else if (opts.slug) {
    slugs = [opts.slug];
  } else {
    console.error('Provide a slug or --all. See --help.');
    process.exit(1);
  }

  let failures = 0;
  for (const slug of slugs) {
    try {
      await expandArticle(client, slug, opts.dryRun);
    } catch (err) {
      failures++;
      console.error(`[${slug}] ERROR: ${(err as Error).message}`);
    }
  }

  if (failures > 0) {
    console.error(`${failures} article(s) failed.`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
