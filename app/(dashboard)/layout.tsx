/**
 * Dashboard Layout
 * Placeholder — wire up your navigation, sidebar, etc. here.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-plus-jakarta-sans, sans-serif)" }}>
      {children}
    </div>
  );
}
