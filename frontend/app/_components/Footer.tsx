// app/_components/Footer.tsx
// footer — black band closing every page. 4-col link list, M stripe, corporate disclaimer.

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto bg-canvas text-body">
            <div className="w-full py-16">
                <div className="mt-16 border-t border-hairline">
                    <div className="mx-auto w-full max-w-[1440px] px-6 pt-8">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="text-xs tracking-[0.5px] text-muted">
                            © {new Date().getFullYear()} My App
                        </p>

                        <nav
                            aria-label="Footer links"
                            className="flex flex-wrap items-center gap-4 text-xs tracking-[0.5px] text-muted"
                        >
                            <Link href="/" className="transition-colors hover:text-body">
                                Home
                            </Link>
                            <Link href="/dashboard" className="transition-colors hover:text-body">
                                Dashboard
                            </Link>
                            <Link href="/register" className="transition-colors hover:text-body">
                                Register
                            </Link>
                            <Link href="/login" className="transition-colors hover:text-body">
                                Login   
                            </Link>
                        </nav>
                            <p className="text-xs tracking-[0.5px] text-muted">EN · Global</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
