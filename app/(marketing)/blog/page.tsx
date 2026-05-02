import Link from "next/link";

const posts = [
  { slug: "ki-nachhilfe-vs-traditionell", title: "KI-Nachhilfe vs. traditionelle Nachhilfe", excerpt: "Warum KI-gestütztes Lernen oft effektiver ist...", date: "2024-01-15" },
  { slug: "abi-mathe-tipps", title: "10 Tipps für das Mathe-Abitur", excerpt: "Mit diesen Strategien meisterst du das Abitur...", date: "2024-01-10" },
  { slug: "lernmethoden-2024", title: "Die besten Lernmethoden 2024", excerpt: "Wissenschaftlich bewährte Techniken...", date: "2024-01-05" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all h-full">
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
