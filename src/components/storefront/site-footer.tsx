import Link from "next/link";
import { FaInstagram, FaFacebookF } from "react-icons/fa";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl">Ferro</p>

            <p className="mt-3 max-w-sm text-sm text-stone-300">
              Magnetic photo frames, made from your own photos. No nails, no
              glue—they hold themselves to any metal surface in your home.
              Designed and manufactured in India.
            </p>

            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ferro on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-600 transition-colors hover:border-paper hover:text-paper"
              >
                <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ferro on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-600 transition-colors hover:border-paper hover:text-paper"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Shop
            </p>

            <ul className="mt-4 space-y-2.5 text-sm text-stone-300">
              <li>
                <Link href="/products" className="hover:text-paper">
                  All Frames
                </Link>
              </li>
              <li>
                <Link
                  href="/products?shape=rectangle"
                  className="hover:text-paper"
                >
                  Rectangle
                </Link>
              </li>
              <li>
                <Link
                  href="/products?shape=circle"
                  className="hover:text-paper"
                >
                  Circle
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-paper">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Support
            </p>

            <ul className="mt-4 space-y-2.5 text-sm text-stone-300">
              <li>
                <Link href="/#faq" className="hover:text-paper">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-paper">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-paper">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-paper">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-700 pt-6 text-xs text-stone-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Ferro. All rights reserved.</p>

          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-paper">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-paper">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
