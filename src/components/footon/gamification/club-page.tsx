"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tierFor } from "@/lib/gamification/level";
import { useConfig, useMyClub } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { MyClubView } from "./club-view";
import { ShareCardRenderer } from "./share-card";

/** A club page: yours (share + customise) or a friend's (look only). */
export function ClubPage({ userId = "me" }: { userId?: string }) {
  const club = useMyClub(userId);
  const config = useConfig().data;

  if (club.isError) return <p className="text-sm text-muted-foreground">{copy.clubUnavailable}</p>;
  if (!club.data || !config) return <Skeleton className="h-[340px] rounded-3xl" />;

  const tierName = tierFor(club.data.level, config).name;
  return (
    <div className="flex flex-col gap-4">
      <MyClubView club={club.data} tierName={tierName} />
      {userId === "me" && (
        <>
          <ShareCardRenderer club={club.data} tierName={tierName} />
          <Button asChild variant="ghost" size="lg">
            <Link href="/shop">
              <ShoppingBag aria-hidden="true" />
              {copy.customise}
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}

/** Profile's door to My Club: the kit and level at a glance. */
export function MyClubLink() {
  const club = useMyClub().data;
  const config = useConfig().data;
  return (
    <Link
      href="/me/club"
      className="group block rounded-3xl outline-none transition-transform duration-200 ease-spring focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]"
      aria-label={`${copy.myClub}. ${copy.myClubBlurb}`}
    >
      {club && config ? (
        <MyClubView club={club} tierName={tierFor(club.level, config).name} size="compact" />
      ) : (
        <Skeleton className="h-[230px] rounded-3xl" />
      )}
    </Link>
  );
}
