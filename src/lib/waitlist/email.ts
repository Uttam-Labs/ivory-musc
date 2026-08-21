import "server-only";

import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type Branding = { logoUrl?: string; siteUrl?: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
}

export async function sendWaitlistEmails(email: string, branding: Branding = {}) {
  const user = env.NODEMAILER_EMAIL || env.SMTP_USER;
  const password = env.NODEMAILER_APP_PASSWORD || env.SMTP_PASSWORD;
  const from = env.WAITLIST_EMAIL_FROM || env.CONTACT_EMAIL_FROM || user;
  if (!env.SMTP_HOST || !user || !password || !from) {
    throw new Error("Waitlist SMTP delivery is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user, pass: password },
  });
  const logo = branding.logoUrl
    ? `<img src="${escapeHtml(branding.logoUrl)}" width="128" alt="Ivory Muse" style="display:block;width:128px;max-width:100%;height:auto;margin:0 auto;border:0">`
    : `<div style="font:28px Georgia,serif;letter-spacing:5px;color:#9b504a">IVORY MUSE</div>`;
  const siteUrl = branding.siteUrl || env.NEXT_PUBLIC_SITE_URL || "";
  const safeEmail = escapeHtml(email);
  const subscribedAt = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Australia/Sydney",
  }).format(new Date());
  const welcomeHtml = `<!doctype html><html><body style="margin:0;background:#f8f0e8;color:#333"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:38px 16px"><table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#fff9f3;border:1px solid #e7d8cb"><tr><td align="center" style="padding:38px 28px;border-bottom:1px solid #e7d8cb">${logo}</td></tr><tr><td align="center" style="padding:48px 42px"><p style="margin:0 0 12px;font:12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9b504a">Ivory Muse Waitlist</p><h1 style="margin:0 0 20px;font:normal 34px Georgia,serif;color:#9b504a">Welcome to our world of silk</h1><p style="margin:0 auto 28px;max-width:470px;font:15px/1.8 Arial,sans-serif;color:#645d58">Thank you for joining the Ivory Muse waitlist. You will be among the first to hear about our launch, new collections and stories celebrating fine silk.</p>${siteUrl ? `<a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:14px 30px;background:#9b504a;font:12px Arial,sans-serif;letter-spacing:1px;color:#fff;text-decoration:none;text-transform:uppercase">Discover Ivory Muse</a>` : ""}</td></tr><tr><td align="center" style="padding:22px;background:#fff5ea;border-top:1px solid #e7d8cb;font:11px/1.6 Arial,sans-serif;color:#81766e">You received this email because you joined the Ivory Muse waitlist.</td></tr></table></td></tr></table></body></html>`;
  const adminHtml = `<!doctype html><html><body style="margin:0;background:#f4ece4;color:#333"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:36px 16px"><table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#fff9f3;border:1px solid #e5d5c7"><tr><td align="center" style="padding:32px 24px;background:#fff5ea;border-bottom:1px solid #e5d5c7">${logo}</td></tr><tr><td style="padding:42px 40px 22px"><p style="margin:0 0 10px;font:600 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9b504a">Waitlist notification</p><h1 style="margin:0 0 14px;font:normal 30px Georgia,serif;color:#9b504a">A new subscriber has joined</h1><p style="margin:0;font:14px/1.7 Arial,sans-serif;color:#6b625d">A customer has successfully joined the Ivory Muse waitlist and has been synced with the subscriber records.</p></td></tr><tr><td style="padding:10px 40px 34px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5d5c7;background:#fff"><tr><td style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8c7d74">Email address</td><td align="right" style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:14px Arial,sans-serif;color:#333"><a href="mailto:${safeEmail}" style="color:#9b504a;text-decoration:none">${safeEmail}</a></td></tr><tr><td style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8c7d74">Customer tag</td><td align="right" style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:14px Arial,sans-serif;color:#333">Ivory Muse Waitlist</td></tr><tr><td style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8c7d74">Marketing consent</td><td align="right" style="padding:17px 20px;border-bottom:1px solid #eee2d7;font:600 12px Arial,sans-serif;color:#55745a">Subscribed</td></tr><tr><td style="padding:17px 20px;font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#8c7d74">Submitted</td><td align="right" style="padding:17px 20px;font:14px Arial,sans-serif;color:#333">${escapeHtml(subscribedAt)} AEST/AEDT</td></tr></table></td></tr><tr><td align="center" style="padding:0 40px 42px"><a href="mailto:${safeEmail}" style="display:inline-block;padding:14px 30px;background:#9b504a;font:600 11px Arial,sans-serif;letter-spacing:1px;color:#fff;text-decoration:none;text-transform:uppercase">Email subscriber</a></td></tr><tr><td align="center" style="padding:20px;background:#fff5ea;border-top:1px solid #e5d5c7;font:11px/1.6 Arial,sans-serif;color:#81766e">Ivory Muse · Instagram waitlist landing page</td></tr></table></td></tr></table></body></html>`;

  const messages = [transporter.sendMail({
    from,
    to: email,
    subject: env.WAITLIST_WELCOME_SUBJECT,
    text: "Thank you for joining the Ivory Muse waitlist. You will be among the first to hear about our launch and new collections.",
    html: welcomeHtml,
  })];

  const notificationTo = env.WAITLIST_NOTIFICATION_TO || env.CONTACT_EMAIL_TO;
  if (notificationTo) {
    messages.push(transporter.sendMail({
      from,
      to: notificationTo,
      replyTo: email,
      subject: "New Ivory Muse waitlist subscriber",
      text: `A new subscriber joined the Ivory Muse waitlist.\n\nEmail: ${email}\nTag: Ivory Muse Waitlist\nMarketing consent: Subscribed\nSubmitted: ${subscribedAt} AEST/AEDT`,
      html: adminHtml,
    }));
  }
  await Promise.all(messages);
}
