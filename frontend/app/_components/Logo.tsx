
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="Trailidea">
      <span className="text-lg font-bold uppercase tracking-[1.5px] text-on-dark">
        Trailidea
      </span>
    </Link>
  );
}
