/**
 * Schema.org Article JSON-LD generator.
 *
 * Rendered as a <script type="application/ld+json"> in the guide page head
 * so Google surfaces rich results. Kept intentionally small — the Article
 * type has lots of optional fields but we only fill the ones we can back
 * with real data.
 */

import type { SeoFrontmatter } from './types';

const DEFAULT_AUTHOR = 'Ben Kurz';
const DEFAULT_PUBLISHER = 'Saastudio LLC';

export interface ArticleJsonLdInput {
  frontmatter: SeoFrontmatter;
  canonicalUrl: string;
  plainTextExcerpt: string;
}

export function articleJsonLd({
  frontmatter,
  canonicalUrl,
  plainTextExcerpt,
}: ArticleJsonLdInput): string {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description ?? plainTextExcerpt,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    author: {
      '@type': 'Person',
      name: frontmatter.author ?? DEFAULT_AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_PUBLISHER,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: [frontmatter.keyword, `${frontmatter.state} UST compliance`],
    about: {
      '@type': 'Thing',
      name: `Underground storage tank compliance in ${frontmatter.state}`,
    },
  };
  return JSON.stringify(json);
}
