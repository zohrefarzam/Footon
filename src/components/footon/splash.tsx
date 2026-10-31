"use client";

import { useEffect } from "react";
import { motion, useAnimate, useReducedMotion, type AnimationSequence } from "motion/react";

import { FootballPattern, FootballShade } from "./football";

const LETTERS = ["O", "T", "O", "N"];

/**
 * Brand splash. A ball drops in on the right, bounces, then rolls left into
 * the wordmark, writing "OTON" as it passes and landing as the first O.
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

    // how far right of its slot the ball lands before rolling home
    const off = Math.min(window.innerWidth * 0.46, 230);

    const sequence: AnimationSequence = [
      ["[data-ball-x]", { x: off }, { duration: 0 }],
      // 1. drop and first bounce, on the right
      ["[data-ball-y]", { y: [-360, 0] }, { duration: 0.55, ease: fall }],
      ["[data-ball-squash]", { scaleX: [1, 1.2, 1], scaleY: [1, 0.78, 1] }, { duration: 0.22, at: "<+0.5" }],
      ["[data-shadow]", { scale: [0.3, 1], opacity: [0, 0.9] }, { duration: 0.55, ease: fall, at: 0 }],
      ["[data-ball-y]", { y: -84 }, { duration: 0.3, ease: rise, at: 0.6 }],
      ["[data-shadow]", { scale: 0.6, opacity: 0.45 }, { duration: 0.3, ease: rise, at: 0.6 }],
      ["[data-ball-y]", { y: 0 }, { duration: 0.3, ease: fall, at: 0.9 }],
      ["[data-shadow]", { scale: 1, opacity: 0.9 }, { duration: 0.3, ease: fall, at: 0.9 }],
      ["[data-ball-squash]", { scaleX: [1, 1.1, 1], scaleY: [1, 0.88, 1] }, { duration: 0.18, at: 1.16 }],
      // 2. roll left into the slot, spinning by distance travelled
      ["[data-ball-x]", { x: [off, 0] }, { duration: 0.95, ease: roll, at: 0.95 }],
      ["[data-ball-spin]", { rotate: [0, -600] }, { duration: 0.95, ease: roll, at: 0.95 }],
      // 3. letters appear as the ball passes them (right to left)
      ...LETTERS.map(
        (_, i) =>
          [
            `[data-letter="${LETTERS.length - 1 - i}"]`,
            { opacity: [0, 1], y: [10, 0], filter: ["blur(6px)", "blur(0px)"] },
            { duration: 0.32, ease: "easeOut", at: 1.08 + i * 0.1 },
          ] satisfies AnimationSequence[number],
      ),
      // 4. the F lands last, the ball settles, the line underneath
      ["[data-letter='f']", { opacity: [0, 1], x: [-14, 0], filter: ["blur(6px)", "blur(0px)"] }, { duration: 0.4, ease: "easeOut", at: 1.6 }],
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
      aria-label="Footon is loading"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-dots fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div aria-hidden="true" className="flex flex-col items-center">
        <div className="flex items-end font-display text-[84px] leading-[0.8] font-bold italic uppercase">
          <span data-letter="f" style={hidden}>
            F
          </span>

          {/* the ball sits in the slot of the first O */}
          <span className="relative mx-[3px] mb-[1px] size-[60px]">
            <span
              data-ball-x
              className="absolute inset-0 block"
              style={reduce ? undefined : { transform: "translateX(min(46vw, 230px))" }}
            >
              <span
                data-shadow
                className="absolute -bottom-3 left-1/2 block h-2.5 w-[56px] -translate-x-1/2 rounded-[50%] bg-black blur-[3px]"
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

          {LETTERS.map((l, i) => (
            <span key={i} data-letter={i} style={hidden}>
              {l}
            </span>
          ))}
        </div>

        <p data-tagline className="mt-6 text-[15px] font-medium text-muted-foreground" style={hidden}>
          Call the next moment.
        </p>
      </div>
    </motion.div>
  );
}
