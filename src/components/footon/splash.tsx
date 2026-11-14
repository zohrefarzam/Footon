"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion, type AnimationSequence } from "motion/react";

import { FootballPattern, FootballShade } from "./football";

/**
 * Brand splash, right to left. A ball drops in at the far (left) end of the
 * wordmark, bounces, then rolls right to its place at the start of «لاکی فن»,
 * uncovering the name behind it as it goes (Persian letters join, so the word
 * is revealed with a wipe that follows the ball, not letter by letter).
 * ~2.6s, then `onDone`. Reduced motion: the finished wordmark, briefly.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }

    const fall: [number, number, number, number] = [0.55, 0, 1, 0.45]; // gravity: accelerate into the ground
    const rise: [number, number, number, number] = [0, 0.55, 0.45, 1]; // and decelerate out of it
    const roll: [number, number, number, number] = [0.25, 0.9, 0.3, 1];

    // the ball lands just past the end (left) of the word, then rolls back to its slot
    const word = (scope.current as HTMLElement | null)?.querySelector<HTMLElement>("[data-word]");
    const off = -((word?.offsetWidth ?? 200) + 36);

    const sequence: AnimationSequence = [
      ["[data-ball-x]", { x: off }, { duration: 0 }],
      // 1. drop and first bounce, past the end of the word
      ["[data-ball-y]", { y: [-360, 0] }, { duration: 0.55, ease: fall }],
      ["[data-ball-squash]", { scaleX: [1, 1.2, 1], scaleY: [1, 0.78, 1] }, { duration: 0.22, at: "<+0.5" }],
      ["[data-shadow]", { scale: [0.3, 1], opacity: [0, 0.9] }, { duration: 0.55, ease: fall, at: 0 }],
      ["[data-ball-y]", { y: -84 }, { duration: 0.3, ease: rise, at: 0.6 }],
      ["[data-shadow]", { scale: 0.6, opacity: 0.45 }, { duration: 0.3, ease: rise, at: 0.6 }],
      ["[data-ball-y]", { y: 0 }, { duration: 0.3, ease: fall, at: 0.9 }],
      ["[data-shadow]", { scale: 1, opacity: 0.9 }, { duration: 0.3, ease: fall, at: 0.9 }],
      ["[data-ball-squash]", { scaleX: [1, 1.1, 1], scaleY: [1, 0.88, 1] }, { duration: 0.18, at: 1.16 }],
      // 2. roll right into its slot, spinning by distance travelled, uncovering the name
      ["[data-ball-x]", { x: [off, 0] }, { duration: 0.95, ease: roll, at: 0.95 }],
      ["[data-ball-spin]", { rotate: [0, 600] }, { duration: 0.95, ease: roll, at: 0.95 }],
      ["[data-word]", { clipPath: ["inset(-20% 100% -20% 0)", "inset(-20% 0% -20% 0)"], opacity: [1, 1] }, { duration: 0.95, ease: roll, at: 0.95 }],
      // 3. the ball settles, the line underneath
      ["[data-ball-squash]", { scaleX: [1, 1.06, 1], scaleY: [1, 0.94, 1] }, { duration: 0.2, at: 1.86 }],
      ["[data-shadow]", { opacity: 0 }, { duration: 0.3, at: 1.8 }],
      ["[data-tagline]", { opacity: [0, 1], y: [8, 0] }, { duration: 0.4, ease: "easeOut", at: 1.85 }],
    ];
    const run = animate(sequence);

    let cancelled = false;
    run.then(() => {
      if (!cancelled) setTimeout(() => !cancelled && onDone(), 550);
    });
    return () => {
      cancelled = true;
      run.stop();
    };
  }, [animate, onDone, reduce]);

  const hidden = reduce ? undefined : { opacity: 0 };

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
        {/* the ball is the mark, at the start (right) of the name */}
        <div className="flex items-center gap-3">
          <span className="relative z-10 size-[56px] shrink-0">
            <span data-ball-x className="absolute inset-0 block" style={reduce ? undefined : { transform: "translateX(-240px)" }}>
              <span
                data-shadow
                className="absolute -bottom-3 left-1/2 block h-2.5 w-[52px] -translate-x-1/2 rounded-[50%] bg-black blur-[3px]"
                style={{ opacity: 0 }}
              />
              <span data-ball-y className="absolute inset-0 block" style={reduce ? undefined : { transform: "translateY(-360px)" }}>
                <span data-ball-squash className="absolute inset-0 block origin-bottom">
                  <span data-ball-spin className="absolute inset-0 block">
                    <FootballPattern />
                  </span>
                  <FootballShade className="absolute inset-0" />
                </span>
              </span>
            </span>
          </span>
          <span data-word className="font-display text-[64px] leading-[1.25] font-extrabold whitespace-nowrap" style={reduce ? undefined : { clipPath: "inset(-20% 100% -20% 0)" }}>
            لاکی فن
          </span>
        </div>

        <p data-tagline className="mt-6 text-[15px] font-medium text-muted-foreground" style={hidden}>
          لحظهٔ بعدی را پیش‌بینی کن.
        </p>
      </div>
    </motion.div>
  );
}
