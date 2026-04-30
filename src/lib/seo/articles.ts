/**
 * File-based loader for SEO articles.
 *
 * Articles live under /content/seo/*.md and are read at build time. This
 * module is safe to import from server components only — it touches fs.
 */

import fs from 'node:fs';
import path from 'node:path';

import { parseFrontmatter } from './frontmatter';
import type { SeoArticle } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'seo');

export function articleFilePath(slug: string): string {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

export function listArticleSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3));
}

export function loadArticle(slug: string): SeoArticle | null {
  const file = articleFilePath(slug);
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, 'utf8');
  const article = parseFrontmatter(source);
  if (article.frontmatter.slug !== slug) {
    throw new Error(
      `SEO article slug mismatch: filename ${slug}, frontmatter ${article.frontmatter.slug}`,
    );
  }
  return article;
}

export function loadAllPublishedArticles(): SeoArticle[] {
  return listArticleSlugs()
    .map((slug) => loadArticle(slug))
    .filter((a): a is SeoArticle => Boolean(a) && !a!.frontmatter.draft)
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}
