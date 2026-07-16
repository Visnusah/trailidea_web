import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Mountain Peaks",
    image: "/images/landing/cat-mountain-peaks.png",
    shape: "rounded-full",
  },
  {
    name: "Coastal Walks",
    image: "/images/landing/cat-coastal-walks.png",
    shape: "rounded-3xl",
  },
  {
    name: "Forest Loops",
    image: "/images/landing/cat-forest-loops.png",
    shape: "rounded-3xl rounded-tl-[3rem] rounded-br-[3rem]",
  },
  {
    name: "Desert Expeditions",
    image: "/images/landing/cat-desert-expeditions.png",
    shape: "rounded-[2rem]",
  },
];

export default function TrailCategories() {
  return (
    <section className="bg-[#faf9f5] py-24 pt-32">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <span className="mb-2 block text-xl font-semibold italic text-[#35775f]">
          Find your perfect path
        </span>
        <h2 className="mb-12 text-3xl font-bold text-gray-900 md:text-4xl">
          Trail Categories
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href="#"
              className={`group flex flex-col items-center ${i % 2 !== 0 ? "mt-8 md:mt-0" : ""}`}
            >
              <div
                className={`relative mb-4 h-32 w-32 overflow-hidden shadow-lg transition-shadow duration-300 group-hover:shadow-xl md:h-40 md:w-40 ${cat.shape}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 128px, 160px"
                />
                <div className="absolute inset-0 bg-black/20 transition-all duration-300 group-hover:bg-black/10" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#35775f]">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
