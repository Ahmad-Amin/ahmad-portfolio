import { getNewsletterTopicId, getResend, verifyConfirmToken } from "@/lib/subscribe";

function completionFailed() {
  return Response.json(
    { error: "Couldn't complete your subscription. Please try again." },
    { status: 502 },
  );
}

// Confirmation is a POST (triggered by a button on the confirm page), not a link
// that acts on GET: email security scanners pre-fetch links, and that would
// subscribe people who never clicked anything.
export async function POST(req: Request) {
  const resend = getResend();
  const topicId = getNewsletterTopicId();
  if (!resend || !topicId) {
    if (resend) console.error("[subscribe] RESEND_TOPIC_ID is not set; can't complete subscriptions.");
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

  // The Resend account can serve several sites. The topic keeps this site's
  // opt-outs separate from theirs; the segment (optional) is for grouping.
  const topics = [{ id: topicId, subscription: "opt_in" as const }];
  const segmentId = process.env.RESEND_SEGMENT_ID;

  const created = await resend.contacts.create({
    email,
    topics,
    ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
  });
  if (!created.error) return Response.json({ ok: true });

  // Most likely the address is already a contact (a repeat click, or someone on
  // another site's list). They just went through a fresh double opt-in, so make
  // sure they're subscribed, opted in to this topic, and in this site's segment.
  const existing = await resend.contacts.get({ email });
  if (existing.error || !existing.data) {
    console.error("[subscribe] Failed to add contact:", created.error);
    return completionFailed();
  }

  // Resend ignores topic opt-ins for a contact who has unsubscribed from everything.
  if (existing.data.unsubscribed) {
    const updated = await resend.contacts.update({ email, unsubscribed: false });
    if (updated.error) {
      console.error("[subscribe] Failed to re-subscribe contact:", updated.error);
      return completionFailed();
    }
  }

  const optedIn = await resend.contacts.topics.update({ email, topics });
  if (optedIn.error) {
    console.error("[subscribe] Failed to opt contact in to topic:", optedIn.error);
    return completionFailed();
  }

  if (segmentId) {
    // Checked first because the API doesn't document what adding an existing member does.
    const current = await resend.contacts.segments.list({ email, limit: 100 });
    const alreadyInSegment = !current.error && current.data.data.some((s) => s.id === segmentId);

    if (!alreadyInSegment) {
      const added = await resend.contacts.segments.add({ email, segmentId });
      if (added.error) {
        console.error("[subscribe] Failed to add contact to segment:", added.error);
        return completionFailed();
      }
    }
  }

  return Response.json({ ok: true });
}
