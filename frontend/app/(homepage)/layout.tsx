import HomepageNavbar from "./_components/Navbar";
import HomepageFooter from "./_components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HomepageNavbar />
      <main className="flex-1">
        {children}
      </main>
      <HomepageFooter />
    </div>
  );
}