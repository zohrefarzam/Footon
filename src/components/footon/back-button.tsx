"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Back to wherever you came from (Home or Live); falls back to `href` on a fresh load. */
export function BackButton({ href = "/" }: { href?: string }) {
  const router = useRouter();
  return (
    <Button asChild variant="secondary" size="icon-sm" aria-label="بازگشت" className="rounded-[11px]">
      <Link
        href={href}
        onClick={(e) => {
          if (window.history.length > 1) {
            e.preventDefault();
            router.back();
          }
        }}
      >
        <ChevronLeft className="rtl:rotate-180" />
      </Link>
    </Button>
  );
}
