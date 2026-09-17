import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeMarketingProfileToKlaviyo } from "@/lib/waitlist/klaviyo";
import { syncMarketingCustomerToShopify } from "@/lib/waitlist/shopify-customer";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });
const NEWSLETTER_TAG = "newsletter";
const CONSENT_TEXT =
  "I agree to receive emails from Ivory Muse about new collections, design inspiration, exclusive offers and brand updates. I can unsubscribe at any time.";
const CONSENT_SOURCE = "Ivory Muse homepage newsletter form";

export async function POST(request: Request) {
  try {
    const { email } = inputSchema.parse(await request.json());
    const consentedAt = new Date().toISOString();
    const consent = {
      marketingConsent: true as const,
      consentText: CONSENT_TEXT,
      consentedAt,
      consentSource: CONSENT_SOURCE,
    };

    await Promise.all([
      syncMarketingCustomerToShopify(email, NEWSLETTER_TAG, consentedAt),
      subscribeMarketingProfileToKlaviyo(email, consent, {
        source: CONSENT_SOURCE,
        listName: "Ivory Muse Mailing List",
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "We could not complete your subscription. Please try again." },
      { status: 500 },
    );
  }
}
