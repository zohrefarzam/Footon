"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion, type AnimationSequence } from "motion/react";

import { Winky } from "./winky";

/** Confetti thrown when the clover pops: [angle°, distance px, colour, shape]. */
const BITS: [number, number, string, "dot" | "bar"][] = [
  [-160, 120, "#43B883", "bar"],
  [-130, 140, "#FFA83E", "dot"],
  [-100, 150, "#43B883", "dot"],
  [-75, 130, "#FFA83E", "bar"],
  [-45, 145, "#43B883", "bar"],
  [-20, 120, "#FFA83E", "dot"],
  [-145, 90, "#F3F8F4", "dot"],
  [-35, 95, "#F3F8F4", "dot"],
];

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Brand splash: Winky, the lucky ball, drops in, squashes, bounces twice,
 * sprouts its clover (with a little confetti), winks, and «لاکی فن» rises in
 * under it. ~2.4s, then `onDone`. Reduced motion: the finished frame, briefly (set after mount).
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      // no movement: jump straight to the finished frame (the server always renders the first one, so this
      // can't be decided in the markup without a hydration mismatch), hold it briefly, move on
      const instant = { duration: 0 };
      animate([
        ["[data-drop]", { y: 0 }, instant],
        ["[data-shadow]", { opacity: 0.55 }, { ...instant, at: 0 }],
        ["[data-winky-clover]", { scale: 1 }, { ...instant, at: 0 }],
        ["[data-winky-eye-r]", { opacity: 0 }, { ...instant, at: 0 }],
        ["[data-winky-wink]", { opacity: 1 }, { ...instant, at: 0 }],
        ["[data-word]", { opacity: 1 }, { ...instant, at: 0 }],
        ["[data-tagline]", { opacity: 1 }, { ...instant, at: 0 }],
      ]);
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }

    const fall: [number, number, number, number] = [0.55, 0, 1, 0.45]; // gravity: accelerate into the ground
    const rise: [number, number, number, number] = [0, 0.55, 0.45, 1]; // and decelerate out of it
    const pop: [number, number, number, number] = [0.34, 1.56, 0.64, 1]; // ease-spring

    const sequence: AnimationSequence = [
      // 1. the drop, a big squash on landing
      ["[data-drop]", { y: [-420, 0] }, { duration: 0.5, ease: fall }],
      ["[data-shadow]", { scaleX: [0.2, 1], opacity: [0, 0.55] }, { duration: 0.5, ease: fall, at: 0 }],
      ["[data-squash]", { scaleX: [1, 1.22, 0.94, 1], scaleY: [1, 0.76, 1.06, 1] }, { duration: 0.32, at: 0.48 }],
      // 2. two bounces, each smaller
      ["[data-drop]", { y: -86 }, { duration: 0.26, ease: rise, at: 0.62 }],
      ["[data-shadow]", { scaleX: 0.6, opacity: 0.3 }, { duration: 0.26, ease: rise, at: 0.62 }],
      ["[data-drop]", { y: 0 }, { duration: 0.26, ease: fall, at: 0.88 }],
      ["[data-shadow]", { scaleX: 1, opacity: 0.55 }, { duration: 0.26, ease: fall, at: 0.88 }],
      ["[data-squash]", { scaleX: [1, 1.12, 1], scaleY: [1, 0.88, 1] }, { duration: 0.2, at: 1.12 }],
      ["[data-drop]", { y: [0, -24, 0] }, { duration: 0.32, ease: "easeInOut", at: 1.2 }],
      // 3. the clover pops out of its head, with confetti
      ["[data-winky-clover]", { scale: [0, 1.25, 1], rotate: [-30, 12, 0] }, { duration: 0.45, ease: pop, at: 1.3 }],
      ...BITS.map(
        ([a, d], i) =>
          [
            `[data-bit="${i}"]`,
            {
              x: [0, Math.cos(rad(a)) * d],
              y: [0, Math.sin(rad(a)) * d, Math.sin(rad(a)) * d + 40],
              // first values apply from the start of the timeline, so they must be the hidden state
              opacity: [0, 1, 1, 0],
              rotate: [0, a + 200],
              scale: [0, 1, 0.8],
            },
            { duration: 0.8, ease: "easeOut", at: 1.36 },
          ] satisfies AnimationSequence[number],
      ),
      // 4. the wink, with a little head tilt
      ["[data-winky-eye-r]", { scaleY: [1, 0.1] }, { duration: 0.1, at: 1.7 }],
      ["[data-winky-eye-r]", { opacity: [1, 0] }, { duration: 0.01, at: 1.8 }],
      ["[data-winky-wink]", { opacity: [0, 1] }, { duration: 0.01, at: 1.8 }],
      ["[data-squash]", { rotate: [0, -7, 0] }, { duration: 0.45, ease: "easeInOut", at: 1.68 }],
      // 5. the name and the line rise in
      ["[data-word]", { opacity: [0, 1], y: [18, 0], scale: [0.92, 1] }, { duration: 0.42, ease: pop, at: 1.55 }],
      ["[data-tagline]", { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, ease: "easeOut", at: 1.85 }],
    ];
    const run = animate(sequence);

    let cancelled = false;
    run.then(() => {
      if (!cancelled) setTimeout(() => !cancelled && onDone(), 450);
    });
    return () => {
      cancelled = true;
      run.stop();
    };
  }, [animate, onDone, reduce]);

  // the first frame, identical on server and client (reduced motion swaps to the last frame after mount)
  const hidden = { opacity: 0 };

  return (
    <motion.div
      ref={scope}
      role="status"
      aria-label="لاکی فن داره باز میشه"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-dots fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div aria-hidden="true" className="flex flex-col items-center">
        <div className="relative size-[176px]">
          {/* ground shadow, squeezing as the ball rises */}
          <span
            data-shadow
            className="absolute -bottom-1 left-1/2 block h-3.5 w-[120px] -translate-x-1/2 rounded-[50%] bg-black/70 blur-[4px]"
            style={{ opacity: 0 }}
          />
          {/* confetti, thrown from behind the head */}
          <span className="absolute top-[18%] left-1/2 block">
            {BITS.map(([, , colour, shape], i) => (
              <span
                key={i}
                data-bit={i}
                className={shape === "dot" ? "absolute block size-2.5 rounded-full" : "absolute block h-1.5 w-4 rounded-full"}
                style={{ background: colour, opacity: 0 }}
              />
            ))}
          </span>
          <span data-drop className="absolute inset-0 block" style={{ transform: "translateY(-420px)" }}>
            <span data-squash className="absolute inset-0 block origin-bottom">
              <Winky wink={false} sprouted={false} className="size-full drop-shadow-[0_10px_18px_rgb(0_0_0/0.45)]" />
            </span>
          </span>
        </div>

        <p data-word className="mt-5 font-display text-[54px] leading-[1.3] font-black" style={hidden}>
          لاکی فن
        </p>
        <p data-tagline className="mt-1 text-[15px] font-medium text-muted-foreground" style={hidden}>
          لحظهٔ بعدی را پیش‌بینی کن.
        </p>
      </div>
    </motion.div>
  );
}
