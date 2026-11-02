import Link from "next/link";
import { X } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { Button } from "@/components/ui/button";
import { CreateLeagueForm } from "./create-league-form";

export default function NewLeaguePage() {
  return (
    <AppShell dock={false} className="pt-3.5">
      <header className="flex h-11 items-center gap-3">
        <Button asChild variant="secondary" size="icon" aria-label="Close" className="size-10">
          <Link href="/">
            <X className="size-4" />
          </Link>
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold">New league</h1>
        <span className="w-10" />
      </header>
      <CreateLeagueForm />
    </AppShell>
  );
}
