import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Cards are for grouping, not decoration. Prefer one card holding a divided
 * list over a stack of separate cards.
 * `variant="raised"` = floating content (question cards, sheets).
 * `variant="dashed"` = a suggestion or something not unlocked yet.
 */
function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "raised" | "dashed" }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col text-card-foreground",
        variant === "default" && "rounded-xl border border-line bg-surface",
        variant === "raised" &&
          "rounded-2xl border border-[#34343b] bg-surface-2 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)]",
        variant === "dashed" && "rounded-xl border border-dashed border-line-strong bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center justify-between gap-3 px-4 pt-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("text-[15px] font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-[13px] text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-4", className)} {...props} />;
}

function CardRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-row"
      className={cn("flex items-center gap-3 px-4 py-3.5 [&+&]:border-t [&+&]:border-line", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardRow };
