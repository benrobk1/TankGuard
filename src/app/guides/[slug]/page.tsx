import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import {
  listArticleSlugs,
  loadArticle,
} from '@/lib/seo/articles';
import { renderMarkdown, firstParagraph } from '@/lib/seo/markdown';
import { articleJsonLd } from '@/lib/seo/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return listArticleSlugs()
    .map((slug) => loadArticle(slug))
    .filter((a) => a && !a.frontmatter.draft)
    .map((a) => ({ slug: a!.frontmatter.slug }));
}

interface Params {
  slug: string;
}

function canonicalUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://tankguard.com';
  return `${base.replace(/\/$/, '')}/guides/${slug}`;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = loadArticle(slug);
  if (!article || article.frontmatter.draft) {
    return {};
  }

  const description =
    article.frontmatter.description ?? firstParagraph(article.body).slice(0, 160);

  const url = canonicalUrl(slug);

  return {
    title: article.frontmatter.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: article.frontmatter.title,
      description,
      url,
      type: 'article',
      publishedTime: article.frontmatter.date,
      authors: [article.frontmatter.author ?? 'Ben Kurz'],
    },
  };
}

export default async function GuidePage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const article = loadArticle(slug);
  if (!article || article.frontmatter.draft) {
    notFound();
  }

  const excerpt = firstParagraph(article.body);
  const canonical = canonicalUrl(slug);
  const jsonLd = articleJsonLd({
    frontmatter: article.frontmatter,
    canonicalUrl: canonical,
    plainTextExcerpt: excerpt,
  });

  const html = renderMarkdown(article.body);

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/guides"
          className="text-blue-600 hover:text-blue-700 text-sm mb-8 inline-block"
        >
          &larr; All guides
        </Link>

        <header className="mb-8">
          <p className="text-sm uppercase tracking-wide text-gray-500">
            {article.frontmatter.state} &middot; UST compliance guide
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            {article.frontmatter.title}
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            By {article.frontmatter.author ?? 'Ben Kurz'} &middot;{' '}
            <time dateTime={article.frontmatter.date}>
              {new Date(article.frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        </header>

        <article
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Track {article.frontmatter.state} UST deadlines automatically
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            TankGuard encodes every federal and state rule and schedules them
            against your tanks. 3-month service credit if we fail to surface a
            properly-configured deadline — see the{' '}
            <Link href="/terms" className="underline">Terms</Link>.
          </p>
          <Link
            href="/register"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start free &mdash; Plans from $99/mo
          </Link>
        </aside>
      </main>
    </div>
  );
}
