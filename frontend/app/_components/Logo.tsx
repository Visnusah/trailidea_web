
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="App">
      <span className="text-lg font-bold uppercase tracking-[1.5px] text-on-dark">
        Dummy
      </span>
    </Link>
  );
}
