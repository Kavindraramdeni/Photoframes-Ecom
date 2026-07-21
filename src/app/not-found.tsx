import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-data text-sm text-indigo">404</p>
      <h1 className="mt-2 font-display text-3xl text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-graphite">It may have been moved, or the link might be off by a letter.</p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/">Back to homepage</Link>
      </Button>
    </div>
  );
}
