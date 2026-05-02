import Link from "next/link";

export const metadata = {
  title: "Auth - Astra AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            Astra AI
          </Link>
          <p className="mt-2 text-muted-foreground">
            Deine persönliche KI-Nachhilfe
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
