"use client";

import Link from "next/link";

import { track } from "@/lib/track";

/** A sponsor banner's link: reports the tap (`promo_tap`), opens partner sites in a new tab. */
export function PromoLink({
  id,
  slot,
  href,
  external,
  className,
  children,
  ...rest
}: {
  id: string;
  slot: number;
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const onClick = () => track("promo_tap", { id, slot });
  return external ? (
    <a href={href} target="_blank" rel="noopener sponsored" onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  ) : (
    <Link href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </Link>
  );
}
