// app/_components/Navbar.tsx
// top-nav — 64px black bar pinned to top of every page.

import Link from "next/link";
import Logo from "./Logo";


export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm tracking-[0.5px] text-body transition-colors hover:text-on-dark sm:block"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="flex h-10 items-center border border-on-dark px-5 text-xs font-bold uppercase tracking-[1.5px] text-on-dark transition-colors hover:bg-on-dark hover:text-canvas"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
