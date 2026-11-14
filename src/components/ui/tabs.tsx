"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Radix Tabs, restyled as a scrollable underline bar for sections of one
 * screen (the match page: Predict • Chat • Facts • Stats • Lineups • Table • H2H).
 * For 2–4 *filters* over one list, use `SegmentedTabs` instead.
 * Active tab = white label + lime underline; inactive = muted.
 */
const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "-mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative flex h-11 shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors duration-200",
        "after:absolute after:inset-x-3 after:bottom-[-1px] after:h-0.5 after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-spring",
        "hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60",
        "data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("animate-in-up outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
