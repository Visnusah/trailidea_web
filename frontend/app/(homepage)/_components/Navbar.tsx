"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomepageNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Trailidea home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#35775f]">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Trailidea</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <Link href="#" className="font-medium text-gray-800 transition-colors duration-200 hover:text-[#35775f]">
              Discover
            </Link>
            <Link href="#" className="font-medium text-gray-800 transition-colors duration-200 hover:text-[#35775f]">
              Feed
            </Link>
            <Link href="#" className="font-medium text-gray-800 transition-colors duration-200 hover:text-[#35775f]">
              Community
            </Link>
            <Link href="#" className="font-medium text-gray-800 transition-colors duration-200 hover:text-[#35775f]">
              About
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="text-gray-800 hover:text-[#35775f] focus:outline-none md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="rounded-2xl bg-white/95 px-6 py-4 shadow-xl backdrop-blur-md md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              <Link href="#" className="font-medium text-gray-800 transition-colors hover:text-[#35775f]" onClick={() => setMobileOpen(false)}>
                Discover
              </Link>
              <Link href="#" className="font-medium text-gray-800 transition-colors hover:text-[#35775f]" onClick={() => setMobileOpen(false)}>
                Feed
              </Link>
              <Link href="#" className="font-medium text-gray-800 transition-colors hover:text-[#35775f]" onClick={() => setMobileOpen(false)}>
                Community
              </Link>
              <Link href="#" className="font-medium text-gray-800 transition-colors hover:text-[#35775f]" onClick={() => setMobileOpen(false)}>
                About
              </Link>
              <Link
                href="/register"
                className="mt-2 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                Join Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
