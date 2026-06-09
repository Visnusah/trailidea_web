/**
 * Auth Group Layout
 * Wraps /login and /register — no shared chrome needed here;
 * each auth page renders its own full-screen layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
