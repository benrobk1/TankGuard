/**
 * SEO article types.
 *
 * Articles live as markdown files under /content/seo/. Each file has YAML
 * frontmatter with the fields below, followed by the article body in
 * markdown. A `draft: true` flag keeps scaffolded titles out of the public
 * /guides route until a writer (or the generator script) expands them.
 */

export interface SeoFrontmatter {
  /** H1 of the article + default <title> tag. */
  title: string;
  /** Two-letter USPS code for the jurisdiction the article is about. */
  state: string;
  /** Primary long-tail keyword the article is targeting. */
  keyword: string;
  /** ISO date string of first publish (or scaffold date while draft). */
  date: string;
  /** URL slug. Must match the file name without the .md extension. */
  slug: string;
  /** Meta description (≤160 chars). Falls back to the first paragraph. */
  description?: string;
  /** When true, the article is excluded from /guides and sitemap. */
  draft?: boolean;
  /** Author attribution. Defaults to "Ben Kurz" (Saastudio founder). */
  author?: string;
}

export interface SeoArticle {
  frontmatter: SeoFrontmatter;
  /** Raw markdown body (everything after the closing `---`). */
  body: string;
}
