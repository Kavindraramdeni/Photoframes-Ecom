"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* Signature motif: magnetic field lines curving toward the frame,
          a literal reference to how the product actually works. */}
      <svg
        className="field-lines absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const offset = i * 40;
          return (
            <motion.path
              key={i}
              d={`M ${-100 - offset} ${150 + offset * 8} Q 600 ${380 + offset * 4} ${1300 + offset} ${150 + offset * 8}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.35 }}
              transition={{ duration: 1.8, delay: i * 0.12, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-32 lg:px-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-data text-xs uppercase tracking-[0.2em] text-indigo"
          >
            No nails · No glue · Just magnets
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-5xl font-medium leading-[1.05] text-ink sm:text-6xl"
          >
            Your photos,
            <br />
            <span className="italic text-indigo">held by nothing</span>
            <br />
            but attraction.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-lg text-ink-soft"
          >
            Upload a photo, pick a frame, and Ferro ships it custom-made to your door.
            Each frame snaps to any metal surface — fridge, locker, shelf — and lifts
            off just as easily.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/products">
                Design Your Frame <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#gallery">See Customer Frames</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-md rounded-3xl border border-line bg-paper-warm shadow-[0_40px_80px_-30px_rgba(15,17,21,0.35)]"
        >
          <div className="absolute inset-6 rounded-2xl border-4 border-ink bg-white shadow-inner" />
          <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo font-data text-xs font-medium text-white shadow-lg">
            8×10
          </div>
        </motion.div>
      </div>
    </section>
  );
}
