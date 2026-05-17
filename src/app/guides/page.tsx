import Link from 'next/link';
import type { Metadata } from 'next';

import { loadAllPublishedArticles } from '@/lib/seo/articles';
import { firstParagraph } from '@/lib/seo/markdown';

export const metadata: Metadata = {
  title: 'UST compliance guides — TankGuard',
  description:
    'State-by-state guides for underground storage tank compliance. Deadlines, inspections, and operator training requirements, explained.',
};

export default function GuidesIndexPage() {
  const articles = loadAllPublishedArticles();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            UST compliance guides
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            State-by-state explanations of the deadlines, inspections, and
            operator requirements that apply to underground storage tanks.
            Written by Ben Kurz, founder of Saastudio LLC.
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500">No guides published yet.</p>
        ) : (
          <ul className="space-y-8 border-t border-gray-100 pt-8">
            {articles.map((a) => (
              <li key={a.frontmatter.slug}>
                <Link
                  href={`/guides/${a.frontmatter.slug}`}
                  className="block group"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {a.frontmatter.state}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {a.frontmatter.title}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {a.frontmatter.description ??
                      firstParagraph(a.body).slice(0, 200)}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {new Date(a.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
