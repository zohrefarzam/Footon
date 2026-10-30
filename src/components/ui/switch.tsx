"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px] outline-none transition-colors duration-200",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#27272a]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full transition-transform duration-[350ms] ease-spring",
          "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-primary-foreground",
          "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-muted-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
