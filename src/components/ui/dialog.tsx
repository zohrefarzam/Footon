"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Radix Dialog, restyled. Two shapes:
 * - `variant="sheet"` (default): bottom sheet in the mobile column, glass, grabber.
 *   Use it for invites, achievements, the quick-reply palette.
 * - `variant="center"`: a small centred card for confirmations.
 * - `variant="full"`: the whole mobile column, for the rare moment that holds
 *   the user (the Level Up screen). Dotted canvas, no glass.
 * Radix handles focus trap, Escape, scroll lock and aria wiring — keep it.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  variant = "sheet",
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { variant?: "sheet" | "center" | "full"; closeLabel?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 border border-line-strong text-foreground outline-none duration-300",
          variant === "sheet" &&
            "glass inset-x-0 bottom-0 mx-auto max-h-[85dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] border-b-0 px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
          variant === "center" &&
            "top-1/2 left-1/2 w-[calc(min(100vw,430px)-40px)] -translate-1/2 rounded-3xl bg-surface-2 p-5 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          variant === "full" &&
            "inset-0 mx-auto w-full max-w-[430px] overflow-y-auto border-0 bg-background px-5 pt-[calc(28px+env(safe-area-inset-top))] pb-[calc(20px+env(safe-area-inset-bottom))] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      >
        {variant === "sheet" && <span aria-hidden="true" className="mx-auto h-1 w-10 shrink-0 rounded-full bg-line-strong" />}
        {/* dotted canvas behind the content (a separate layer: twMerge treats bg-dots as a background colour) */}
        {variant === "full" && <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-dots" />}
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute end-4 top-4 flex size-9 items-center justify-center rounded-sm bg-surface-3 text-muted-foreground outline-none transition-[transform,color] duration-200 ease-spring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-95"
        >
          <X className="size-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1 pe-12", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("flex flex-col gap-2 pt-1", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-[22px] font-bold tracking-[-0.03em] text-balance", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
