export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800">
      {children}
    </main>
  );
} 