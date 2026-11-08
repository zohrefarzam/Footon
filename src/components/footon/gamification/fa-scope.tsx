import { cn } from "@/lib/utils";

/**
 * A Persian, right-to-left island inside the (English) app. Every
 * gamification surface renders inside one, so logical utilities (ps-, ms-,
 * start-) flip and Vazirmatn draws the Persian text.
 */
export function FaScope({
  as: Tag = "div",
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "span" | "section" }) {
  return <Tag dir="rtl" lang="fa" className={cn("fa-scope", className)} {...props} />;
}

/** Latin terms (XP) and signed numbers inside Persian text keep their own direction. */
export function Bdi({ children, className }: { children: React.ReactNode; className?: string }) {
  return <bdi className={className}>{children}</bdi>;
}
