import Image from "next/image";

const trails = [
  {
    name: "Glacier Point Trail",
    image: "/images/landing/trail-glacier-point.png",
    rating: "4.9",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-800",
    description:
      "Experience breathtaking views of Yosemite Valley, Half Dome, and Yosemite Falls.",
    distance: "12.4 mi",
    duration: "6-8 hrs",
  },
  {
    name: "Emerald Lake Loop",
    image: "/images/landing/trail-emerald-lake.png",
    rating: "4.8",
    difficulty: "Easy",
    difficultyColor: "bg-green-100 text-green-800",
    description:
      "A gentle, family-friendly walk around a stunning alpine lake surrounded by pines.",
    distance: "3.2 mi",
    duration: "1.5 hrs",
  },
  {
    name: "Red Rock Canyon",
    image: "/images/landing/trail-red-rock.png",
    rating: "4.7",
    difficulty: "Moderate",
    difficultyColor: "bg-yellow-100 text-yellow-800",
    description:
      "Navigate through stunning sandstone formations and discover hidden desert oases.",
    distance: "6.5 mi",
    duration: "3-4 hrs",
  },
];

export default function PopularTrails() {
  return (
    <section className="relative mx-4 mb-20 overflow-hidden rounded-[3rem] bg-[#f2f8f5] py-20 sm:mx-6 lg:mx-8 lg:rounded-[4rem]">
      {/* Decorative background blob */}
      <div className="pointer-events-none absolute -mr-20 -mt-20 right-0 top-0 opacity-10">
        <svg height="400" viewBox="0 0 200 200" width="400" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-46.8C87.4,-34.5,90.1,-20,89.5,-5.8C88.9,8.4,85.1,22.4,77.5,34.4C69.9,46.4,58.4,56.4,45.8,63.9C33.2,71.4,19.6,76.4,5.4,77.9C-8.9,79.4,-23.7,77.4,-36.8,71C-49.9,64.6,-61.2,53.8,-70.2,41C-79.2,28.2,-85.9,13.4,-86.3,-1.6C-86.7,-16.6,-80.8,-31.8,-71.4,-44C-62,-56.2,-49,-65.4,-35.4,-72.6C-21.8,-79.8,-7.6,-85.1,6.6,-86.6C20.8,-88.1,30.6,-83.6,44.7,-76.4Z"
            fill="#2d604e"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-2 block text-xl font-semibold italic text-[#35775f]">
            Top rated by community
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Most Popular Trails
          </h2>
        </div>

        {/* Trail Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {trails.map((trail) => (
            <div
              key={trail.name}
              className="overflow-hidden rounded-3xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Card Image */}
              <div className="relative h-64">
                <Image
                  src={trail.image}
                  alt={trail.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Rating Badge */}
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-900 backdrop-blur-sm">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {trail.rating}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {trail.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${trail.difficultyColor}`}
                  >
                    {trail.difficulty}
                  </span>
                </div>
                <p className="mb-4 text-sm text-gray-600">{trail.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {trail.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    {trail.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
