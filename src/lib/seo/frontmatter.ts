/**
 * Minimal YAML-frontmatter parser.
 *
 * We only need the flat subset: `key: value`, with optional quoted strings
 * and one boolean field (`draft`). Using gray-matter would pull in js-yaml
 * and its 1MB of dependencies for a schema we fully control here.
 */

import type { SeoArticle, SeoFrontmatter } from './types';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseFrontmatter(source: string): SeoArticle {
  const match = source.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error('SEO article is missing --- frontmatter block');
  }

  const [, yamlBlock, body] = match;
  const data: Record<string, unknown> = {};

  for (const raw of yamlBlock.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const colon = line.indexOf(':');
    if (colon === -1) {
      throw new Error(`Unparseable frontmatter line: ${raw}`);
    }

    const key = line.slice(0, colon).trim();
    let value: string | boolean = line.slice(colon + 1).trim();

    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  const required: (keyof SeoFrontmatter)[] = [
    'title',
    'state',
    'keyword',
    'date',
    'slug',
  ];
  for (const k of required) {
    if (typeof data[k] !== 'string' || !data[k]) {
      throw new Error(`SEO frontmatter missing required field: ${k}`);
    }
  }

  const frontmatter: SeoFrontmatter = {
    title: data.title as string,
    state: (data.state as string).toUpperCase(),
    keyword: data.keyword as string,
    date: data.date as string,
    slug: data.slug as string,
    description:
      typeof data.description === 'string' ? data.description : undefined,
    draft: data.draft === true,
    author: typeof data.author === 'string' ? data.author : undefined,
  };

  return { frontmatter, body };
}

/** Serialize a frontmatter object + body back into a markdown file. */
export function stringifyArticle(article: SeoArticle): string {
  const fm = article.frontmatter;
  const lines: string[] = ['---'];

  const pairs: [string, unknown][] = [
    ['title', fm.title],
    ['state', fm.state],
    ['keyword', fm.keyword],
    ['date', fm.date],
    ['slug', fm.slug],
  ];
  if (fm.description !== undefined) pairs.push(['description', fm.description]);
  if (fm.author !== undefined) pairs.push(['author', fm.author]);
  if (fm.draft !== undefined) pairs.push(['draft', fm.draft]);

  for (const [k, v] of pairs) {
    if (typeof v === 'string' && /[:#'"]/g.test(v)) {
      lines.push(`${k}: "${v.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(article.body.trim());
  lines.push('');

  return lines.join('\n');
}
