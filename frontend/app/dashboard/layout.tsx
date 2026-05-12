import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar />
      <div className="flex-1 bg-surface min-h-screen">{children}</div>
    </div>
  );
}
