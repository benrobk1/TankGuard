import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string | null;
  tags: string[];
  publishedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">&larr; Back to Blog</Link>
          {post.category && (
            <span className="text-xs font-medium text-blue-400 bg-blue-900/50 px-2 py-1 rounded">{post.category}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mt-3">{post.title}</h1>
          <div className="mt-4 text-sm text-slate-300">
            By {post.author} &middot; {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900">Never miss a compliance deadline</h3>
          <p className="text-gray-600 mt-1 text-sm">TankGuard tracks every EPA and state requirement for your underground storage tanks.</p>
          <Link href="/register" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started — $99/month
          </Link>
        </div>
      </main>
    </div>
  );
}
