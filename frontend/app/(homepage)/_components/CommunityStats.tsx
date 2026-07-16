import Image from "next/image";

const stats = [
  { value: "120k+", label: "Verified Trails" },
  { value: "85k+", label: "Active Explorers" },
  { value: "1.2M+", label: "Shared Logs" },
  { value: "50+", label: "Countries" },
];

const avatars = [
  { src: "/images/landing/avatar-1.png", alt: "Community member" },
  { src: "/images/landing/avatar-2.png", alt: "Community member" },
  { src: "/images/landing/avatar-3.png", alt: "Community member" },
];

export default function CommunityStats() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          {/* Stats Grid */}
          <div className="grid w-full grid-cols-2 gap-6 lg:w-1/2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-gray-100 bg-[#faf9f5] p-8 text-center shadow-sm"
              >
                <div className="mb-2 text-3xl font-extrabold text-[#35775f]">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Join a Global Community of Explorers
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              Trailidea isn&apos;t just an app; it&apos;s a movement of nature
              lovers. Share your journeys, discover hidden gems recommended by
              locals, and connect with people who share your passion for the
              great outdoors.
            </p>

            {/* Avatar Stack + CTA */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {avatars.map((avatar, i) => (
                  <Image
                    key={i}
                    src={avatar.src}
                    alt={avatar.alt}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-white object-cover"
                  />
                ))}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-sm font-medium text-gray-500">
                  +10k
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                Join our growing community today!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
