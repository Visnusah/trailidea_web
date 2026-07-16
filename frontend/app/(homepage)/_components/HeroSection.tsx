import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pb-20 pt-32 lg:pb-32 lg:pt-48">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[3rem] bg-gray-50 lg:rounded-b-[4rem]">
        <Image
          src="/images/landing/hero-mountain.png"
          alt="Hiker overlooking a mountain range at golden hour"
          fill
          className="object-cover object-center opacity-80"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1
            className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-7xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Explore the World,
            <br />
            One <span className="text-[#35775f]">Trail</span> at a Time
          </h1>
          <p className="mb-10 mt-4 max-w-lg text-lg text-gray-700 lg:text-xl">
            Discover unforgettable adventures, explore breathtaking landscapes,
            and connect with a community of passionate hikers on Trailidea.
          </p>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#35775f] px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#2d604e] hover:shadow-xl"
            >
              Start Your Journey
            </Link>
            <Link
              href="#"
              className="group inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg"
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e1efe7] text-[#35775f] transition-colors group-hover:bg-[#35775f] group-hover:text-white">
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4l12 6-12 6z" />
                </svg>
              </div>
              Watch Video
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Search/Filter Bar */}
      <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-4xl -translate-x-1/2 translate-y-1/2 px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-4 shadow-xl md:flex-row">
          {/* Location Input */}
          <div className="relative w-full flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Where to? (e.g. Yosemite)"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm leading-5 placeholder-gray-500 transition-colors focus:border-[#35775f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#35775f]/40"
            />
          </div>

          {/* Trail Type Select */}
          <div className="relative w-full border-l border-gray-200 pl-4 md:w-auto">
            <select className="block w-full cursor-pointer bg-transparent py-3 pl-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-0">
              <option>All Trail Types</option>
              <option>Mountain Peaks</option>
              <option>Coastal Walks</option>
              <option>Forest Loops</option>
            </select>
          </div>

          {/* Difficulty Select */}
          <div className="relative w-full border-l border-gray-200 pl-4 md:w-auto">
            <select className="block w-full cursor-pointer bg-transparent py-3 pl-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-0">
              <option>Any Difficulty</option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-xl bg-[#35775f] p-4 text-white shadow-sm transition-colors hover:bg-[#2d604e] focus:outline-none focus:ring-2 focus:ring-[#35775f]/50 focus:ring-offset-2 md:w-auto"
            aria-label="Search trails"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
