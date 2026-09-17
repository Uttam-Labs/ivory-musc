import { NextResponse } from "next/server";
import { z } from "zod";
import { trackContactEnquiryInKlaviyo } from "@/lib/contact/klaviyo";
import { uploadContactAttachment } from "@/lib/contact/shopify-file";
import { storeContactEnquiry } from "@/lib/contact/shopify-metaobject";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().max(3000).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const input = contactSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      website: formData.get("website"),
    });
    const attachmentValue = formData.get("attachment");
    const attachment = attachmentValue instanceof File && attachmentValue.size > 0
      ? await uploadContactAttachment(attachmentValue, input.name)
      : undefined;
    const submission = {
      ...input,
      submittedAt: new Date().toISOString(),
      attachmentId: attachment?.id,
      attachmentName: attachment?.filename,
    };
    const deliveries = await Promise.allSettled([
      storeContactEnquiry(submission),
      trackContactEnquiryInKlaviyo(submission),
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
