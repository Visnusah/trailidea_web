import Link from "next/link";

const footerLinks = {
  explore: [
    { label: "Find Trails", href: "#" },
    { label: "Top Destinations", href: "#" },
    { label: "Trail Collections", href: "#" },
    { label: "Interactive Map", href: "#" },
  ],
  community: [
    { label: "Community Feed", href: "#" },
    { label: "Events & Meetups", href: "#" },
    { label: "Top Contributors", href: "#" },
    { label: "Trail Safety Guides", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export default function HomepageFooter() {
  return (
    <footer className="bg-gray-900 pb-10 pt-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Footer Grid */}
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#479577]">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Trailidea</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Inspiring outdoor exploration and connecting nature lovers
              worldwide, one trail at a time.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-6 text-lg font-semibold">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-[#6bb397]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-6 text-lg font-semibold">Community</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-[#6bb397]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-lg font-semibold">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-[#6bb397]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Trailidea. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
