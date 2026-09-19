import { getResend, verifyConfirmToken } from "@/lib/subscribe";

// Confirmation is a POST (triggered by a button on the confirm page), not a link
// that acts on GET: email security scanners pre-fetch links, and that would
// subscribe people who never clicked anything.
export async function POST(req: Request) {
  const resend = getResend();
  if (!resend) {
    return Response.json({ error: "Signup isn't available right now." }, { status: 503 });
  }

  let token = "";
  try {
    const body = (await req.json()) as { token?: unknown };
    if (typeof body.token === "string") token = body.token;
  } catch {
    // Falls through to the invalid-token response.
  }

  const email = token ? verifyConfirmToken(token) : null;
  if (!email) {
    return Response.json(
      { error: "This confirmation link is invalid or has expired. Please sign up again." },
      { status: 400 },
    );
  }

  const created = await resend.contacts.create({ email });
  if (!created.error) return Response.json({ ok: true });

  // Most likely the address is already a contact (a repeat click, or someone who
  // signed up before). Confirm that, and re-subscribe them if they had opted out,
  // since they just went through a fresh double opt-in.
  const existing = await resend.contacts.get({ email });
  if (existing.error || !existing.data) {
    console.error("[subscribe] Failed to add contact:", created.error);
    return Response.json(
      { error: "Couldn't complete your subscription. Please try again." },
      { status: 502 },
    );
  }

  if (existing.data.unsubscribed) {
    const updated = await resend.contacts.update({ email, unsubscribed: false });
    if (updated.error) {
      console.error("[subscribe] Failed to re-subscribe contact:", updated.error);
      return Response.json(
        { error: "Couldn't complete your subscription. Please try again." },
        { status: 502 },
      );
    }
  }

  return Response.json({ ok: true });
}
