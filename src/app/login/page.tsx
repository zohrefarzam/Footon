import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "ورود به لاکی فن",
};

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-background">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
