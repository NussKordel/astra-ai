export const metadata = {
  title: "Astra AI",
  description: "KI-Nachhilfe für Schüler",
};

export default function MarketingLayout({
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
