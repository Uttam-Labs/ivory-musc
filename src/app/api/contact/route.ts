import { NextResponse } from "next/server";
import type { SanityImageSource } from "@sanity/image-url";
import { z } from "zod";
import { sendContactEmail } from "@/lib/contact/email";
import { storeContactEnquiry } from "@/lib/contact/shopify-metaobject";
import { env, isSanityConfigured } from "@/lib/env";
import { sanityFetch } from "@/sanity/lib/client";
import { sanityImageUrl } from "@/sanity/lib/image";
import { HEADER_SETTINGS_QUERY } from "@/sanity/lib/queries";

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().max(3000).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const input = contactSchema.parse(await request.json());
    const submission = { ...input, submittedAt: new Date().toISOString() };
    const header = isSanityConfigured
      ? await sanityFetch<{ logo?: SanityImageSource }>(HEADER_SETTINGS_QUERY).catch(() => null)
      : null;
    const logoUrl = header?.logo ? sanityImageUrl(header.logo, 320) : undefined;
    const deliveries = await Promise.allSettled([
      storeContactEnquiry(submission),
      sendContactEmail(submission, { logoUrl, siteUrl: env.NEXT_PUBLIC_SITE_URL }),
    ]);
    const failures = deliveries.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failures.length) {
      failures.forEach(({ reason }) => console.error("Contact delivery failed:", reason));
      return NextResponse.json({ error: "Contact delivery is not fully configured or temporarily unavailable." }, { status: 502 });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the required fields." }, { status: 400 });
    return NextResponse.json({ error: "Your message could not be sent." }, { status: 500 });
  }
}
