import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const posts = [
  {
    slug: "ki-nachhilfe-vs-traditionell",
    title: "KI-Nachhilfe vs. traditionelle Nachhilfe",
    excerpt: "Warum KI-gestütztes Lernen oft effektiver ist als klassische Nachhilfe...",
    date: "2024-01-15",
  },
  {
    slug: "abi-mathe-tipps",
    title: "10 Tipps für das Mathe-Abitur",
    excerpt: "Mit diesen Strategien meisterst du das Mathe-Abitur souverän...",
    date: "2024-01-10",
  },
  {
    slug: "lernmethoden-2024",
    title: "Die besten Lernmethoden 2024",
    excerpt: "Wissenschaftlich bewährte Techniken für effizientes Lernen...",
    date: "2024-01-05",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
