import { Instagram } from "lucide-react";

export function InstagramFeed() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <a
        href="https://instagram.com/ferro.frames"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-line bg-paper-warm p-10 text-center sm:flex-row sm:text-left"
      >
        <div className="flex items-center gap-4">
          <Instagram className="h-8 w-8 text-indigo" aria-hidden="true" />
          <div>
            <p className="font-display text-xl text-ink">Follow @ferro.frames</p>
            <p className="text-sm text-graphite">
              New drops, behind-the-scenes manufacturing, and customer unboxings.
            </p>
          </div>
        </div>
        <span className="font-data text-sm text-indigo">View on Instagram →</span>
      </a>
    </section>
  );
}
