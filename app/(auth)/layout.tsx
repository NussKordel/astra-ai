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
    <div className="min-h-screen bg-[#0a0a0a]">
      {children}
    </div>
  );
}
