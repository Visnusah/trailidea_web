"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomepageNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Trailidea home">
            <Image
              src="/logo.png"
              alt="Trailidea logo"
              width={44}
              height={44}
              style={{ objectFit: "contain", mixBlendMode: "multiply" }}
            />
            <span className="text-2xl font-bold text-gray-900">Trailidea</span>
          </Link>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#35775f] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#2d604e] hover:shadow-lg"
            >
              Join Now
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
