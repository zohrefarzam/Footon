import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Footon buttons.
 * - `default` (lime) is the ONE main action on a screen. Never two side by side,
 *   except a Yes/No answer pair where Yes is lime and No is `secondary`.
 * - Never white. Secondary actions are dark (`secondary`, `outline`, `ghost`).
 * - `soft` is for selected/toggled states (chips, quick replies), not for actions.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold outline-none transition-[transform,background-color,color,border-color] duration-200 ease-spring active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-105",
        secondary:
          "bg-surface-3 text-foreground border border-line-strong hover:bg-[#2a2a30]",
        outline:
          "border border-line-strong bg-transparent text-foreground hover:bg-surface-2",
        ghost: "bg-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        soft: "bg-primary-soft text-primary border border-primary-line",
        destructive: "bg-loss-soft text-loss border border-loss/30",
        link: "text-foreground underline underline-offset-4 decoration-ring hover:decoration-foreground",
      },
      size: {
        sm: "h-8 rounded-full px-3 text-[13px]",
        default: "h-11 rounded-md px-4 text-[15px]",
        lg: "h-14 rounded-lg px-5 text-base",
        icon: "size-11 rounded-md",
        "icon-sm": "size-9 rounded-sm",
        "icon-lg": "size-14 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
