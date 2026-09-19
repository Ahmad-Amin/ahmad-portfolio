import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { ConfirmSubscription } from "@/components/confirm-subscription";

export const metadata: Metadata = {
  title: "Confirm subscription",
  robots: { index: false, follow: false },
};

export default async function ConfirmSubscriptionPage({
  searchParams,
}: PageProps<"/subscribe/confirm">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  return (
    <Section id="confirm" labelledBy="confirm-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-2xl">
        {value ? (
          <ConfirmSubscription token={value} />
        ) : (
          <div className="text-center">
            <h1
              id="confirm-heading"
              className="text-display-sm font-semibold tracking-tight text-foreground"
            >
              Link not valid
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
              This confirmation link is missing or incomplete. Try signing up again from the blog.
            </p>
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Go to the blog
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
