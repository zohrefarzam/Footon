import { JoinLanding } from "@/components/footon/join-landing";

export function generateStaticParams() {
  return [{ code: "demo" }];
}

/** Where an invite link lands: see the challenge you were asked into, then join it. Needs a session (the proxy sends you to login and back). */
export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  return <JoinLanding code={decodeURIComponent(code)} />;
}
