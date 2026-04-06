import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author: string;
  category: string | null;
  publishedAt: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog?limit=20`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">&larr; Back to TankGuard</Link>
          <h1 className="text-4xl font-bold">TankGuard Blog</h1>
          <p className="text-slate-300 mt-2">UST compliance guides, state-specific requirements, and industry insights</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
            <p className="text-gray-500 mt-2">We&apos;re working on compliance guides for every state. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all h-full">
                  {post.category && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{post.category}</span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mt-3">{post.title}</h2>
                  {post.excerpt && <p className="text-gray-500 mt-2 text-sm line-clamp-3">{post.excerpt}</p>}
                  <div className="mt-4 text-xs text-gray-400">
                    {post.author} &middot; {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
