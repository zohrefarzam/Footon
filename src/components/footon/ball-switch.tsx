"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { FootballPattern, FootballShade } from "./football";

/**
 * A plain-sized switch whose thumb is the ball. Quiet on purpose: same size as
 * `Switch`, no extra marks. Off = dimmed ball on a dark track; on = full ball on
 * an amber-soft track ("live now"). The ball turns a little as it moves, so it
 * rolls rather than slides. Radix Switch underneath (`role="switch"`, keyboard);
 * reduced motion drops the movement via the global transition override.
 */
export function BallSwitch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="ball-switch"
      className={cn(
        "group inline-flex h-[26px] w-11 shrink-0 items-center rounded-full border p-0.5 outline-none",
        "transition-[background-color,border-color] duration-200",
        "data-[state=unchecked]:border-line-strong data-[state=unchecked]:bg-surface-2",
        "data-[state=checked]:border-live/40 data-[state=checked]:bg-live-soft",
        "focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="ball-switch-thumb"
        className={cn(
          "pointer-events-none relative block size-5 rounded-full transition-[transform,opacity] duration-300 ease-spring-soft",
          "data-[state=unchecked]:opacity-50 data-[state=checked]:translate-x-[18px] rtl:data-[state=checked]:-translate-x-[18px]",
        )}
      >
        <FootballPattern className="absolute inset-0 transition-transform duration-300 ease-spring-soft group-data-[state=checked]:rotate-[100deg] rtl:group-data-[state=checked]:-rotate-[100deg]" />
        <FootballShade className="absolute inset-0" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
