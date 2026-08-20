import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

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
    if (!env.SHOPIFY_STORE_DOMAIN) {
      return NextResponse.json({ error: "Contact service is not configured." }, { status: 503 });
    }
    const input = contactSchema.parse(await request.json());
    const body = new URLSearchParams({
      form_type: "contact",
      utf8: "✓",
      "contact[first_name]": input.firstName,
      "contact[last_name]": input.lastName,
      "contact[email]": input.email,
      "contact[phone]": input.phone,
      "contact[body]": input.message,
    });
    const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/contact`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      redirect: "manual",
      cache: "no-store",
    });
    if (!(response.ok || response.status === 302 || response.status === 303)) {
      throw new Error("Shopify contact submission failed.");
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the required fields." }, { status: 400 });
    return NextResponse.json({ error: "Your message could not be sent." }, { status: 500 });
  }
}
