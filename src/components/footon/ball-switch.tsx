"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { FootballPattern, FootballShade } from "./football";
import { LiveDot } from "./live";

/**
 * A switch whose thumb is the ball. It rolls rather than slides: the panels
 * turn by the distance travelled (28px on a 24px ball ≈ 135°) while the light
 * stays put, so it reads as round. On = amber track ("happening now") with a
 * live dot in the space the ball left. Radix Switch underneath, so it is a real
 * `role="switch"` with keyboard support; reduced motion drops the roll via the
 * global transition override.
 */
export function BallSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="ball-switch"
      className={cn(
        "group relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full border p-[3px] outline-none",
        "transition-[background-color,border-color,transform] duration-300 ease-out-soft active:scale-95",
        "data-[state=unchecked]:border-line-strong data-[state=unchecked]:bg-surface-2",
        "data-[state=checked]:border-live/40 data-[state=checked]:bg-live-soft",
        "focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/* where the ball was: a live dot fades in once it has rolled away */}
      <span
        aria-hidden="true"
        className="absolute start-[13px] flex scale-50 opacity-0 transition-[opacity,transform] duration-300 ease-spring group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100 group-data-[state=checked]:delay-150"
      >
        <LiveDot />
      </span>

      <SwitchPrimitive.Thumb
        data-slot="ball-switch-thumb"
        className={cn(
          "pointer-events-none relative block size-6 rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.5)]",
          "transition-transform duration-[450ms] ease-spring-soft",
          "data-[state=checked]:translate-x-7 rtl:data-[state=checked]:-translate-x-7",
          "data-[state=unchecked]:opacity-90",
        )}
      >
        <FootballPattern className="absolute inset-0 transition-transform duration-[450ms] ease-spring-soft group-data-[state=checked]:rotate-[135deg] rtl:group-data-[state=checked]:-rotate-[135deg]" />
        <FootballShade className="absolute inset-0" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
