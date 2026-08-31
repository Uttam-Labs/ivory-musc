import { NextResponse } from "next/server";
import type { SanityImageSource } from "@sanity/image-url";
import { z } from "zod";
import { env, isSanityConfigured } from "@/lib/env";
import { sendWaitlistEmails } from "@/lib/waitlist/email";
import { subscribeWaitlistProfileToKlaviyo } from "@/lib/waitlist/klaviyo";
import { syncWaitlistCustomerToShopify } from "@/lib/waitlist/shopify-customer";
import { markWelcomeEmailSent, storeWaitlistSubscriber } from "@/lib/waitlist/store";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HEADER_SETTINGS_QUERY } from "@/sanity/lib/queries";

const schema = z.object({
  email: z.string().trim().email().max(254),
  marketingConsent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

const WAITLIST_CONSENT_TEXT =
  "I agree to receive emails from Ivory Muse about new collections, restocks, exclusive offers and brand updates. I can unsubscribe at any time.";
const WAITLIST_CONSENT_SOURCE = "Ivory Muse waitlist page";

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const consentedAt = new Date().toISOString();
    const consent = {
      marketingConsent: true as const,
      consentText: WAITLIST_CONSENT_TEXT,
      consentedAt,
      consentSource: WAITLIST_CONSENT_SOURCE,
    };

    await subscribeWaitlistProfileToKlaviyo(input.email, consent);

    await syncWaitlistCustomerToShopify(input.email, consentedAt);

    const stored = await storeWaitlistSubscriber(
      input.email,
      WAITLIST_CONSENT_TEXT,
      consentedAt,
      WAITLIST_CONSENT_SOURCE,
    ).catch((error) => {
      console.error("Waitlist Sanity storage failed:", error);
      return null;
    });

    if (stored && !stored.welcomeEmailSent) {
      const header = isSanityConfigured
        ? await sanityFetch<{ logo?: SanityImageSource }>(HEADER_SETTINGS_QUERY).catch(() => null)
        : null;
      const emailSent = await sendWaitlistEmails(input.email, {
        logoUrl: header?.logo ? sanityImageUrl(header.logo, 320) : undefined,
        siteUrl: env.NEXT_PUBLIC_SITE_URL,
      }).then(() => true).catch((error) => {
        console.error("Waitlist email delivery failed:", error);
        return false;
      });
      if (emailSent) {
        await markWelcomeEmailSent(stored.id).catch((error) => {
          console.error("Waitlist email status update failed:", error);
        });
      }
    }

    return NextResponse.json(
      { success: true, alreadySubscribed: stored?.alreadySubscribed ?? false },
      { status: stored?.alreadySubscribed ? 200 : 201 },
    );
  } catch (error) {
    console.error("Waitlist submission failed:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid email and accept the marketing consent." }, { status: 400 });
    }
    return NextResponse.json({ error: "We could not complete your registration. Please try again." }, { status: 500 });
  }
}
