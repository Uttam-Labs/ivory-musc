import "server-only";

import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import type { ContactSubmission } from "@/lib/contact/types";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

type EmailBranding = {
  logoUrl?: string;
  siteUrl?: string;
};

export async function sendContactEmail(input: ContactSubmission, branding: EmailBranding = {}) {
  const smtpUser = env.NODEMAILER_EMAIL || env.SMTP_USER;
  const smtpPassword = env.NODEMAILER_APP_PASSWORD || env.SMTP_PASSWORD;
  const from = env.CONTACT_EMAIL_FROM || smtpUser;
  if (!env.SMTP_HOST || !smtpUser || !smtpPassword || !from || !env.CONTACT_EMAIL_TO) {
    throw new Error("Contact SMTP delivery is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: smtpUser, pass: smtpPassword },
  });
  const fullName = `${input.firstName} ${input.lastName}`;
  const safeSubjectName = fullName.replace(/[\r\n]+/g, " ");
  const subject = `${env.CONTACT_EMAIL_SUBJECT_PREFIX}: ${safeSubjectName}`;
  const text = [
    "New contact enquiry",
    "",
    `Name: ${fullName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Submitted: ${input.submittedAt}`,
    "",
    "Message:",
    input.message || "(No message provided)",
  ].join("\n");
  const submittedAt = new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(input.submittedAt));
  const html = createContactEmailTemplate(input, fullName, submittedAt, branding);

  return transporter.sendMail({
    from,
    to: env.CONTACT_EMAIL_TO,
    replyTo: input.email,
    subject,
    text,
    html,
  });
}

function createContactEmailTemplate(
  input: ContactSubmission,
  fullName: string,
  submittedAt: string,
  branding: EmailBranding = {},
) {
  const logo = branding.logoUrl
    ? `<img src="${escapeHtml(branding.logoUrl)}" width="118" alt="Ivory Muse" style="display:block;width:118px;max-width:100%;height:auto;margin:0 auto;border:0;" />`
    : `<div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;letter-spacing:5px;color:#9b504a;">IVORY MUSE</div>`;
  const safeEmail = escapeHtml(input.email);
  const safeMessage = escapeHtml(input.message || "No message provided").replace(/\r?\n/g, "<br />");

  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f6efe8;color:#302c29;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f6efe8;">
      <tr><td align="center" style="padding:34px 16px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#fffaf5;border:1px solid #eaded4;">
          <tr><td align="center" style="padding:34px 32px 28px;border-bottom:1px solid #eaded4;">${logo}</td></tr>
          <tr><td style="padding:38px 42px 12px;">
            <p style="margin:0 0 8px;font:12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9b504a;">Website notification</p>
            <h1 style="margin:0 0 14px;font:normal 30px Georgia,'Times New Roman',serif;color:#9b504a;">New Contact Enquiry</h1>
            <p style="margin:0;font:15px/1.7 Arial,sans-serif;color:#6d6661;">A new message has been submitted through the Ivory Muse contact page.</p>
          </td></tr>
          <tr><td style="padding:20px 42px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-top:1px solid #eaded4;">
              <tr><td style="width:120px;padding:15px 8px 15px 0;border-bottom:1px solid #eaded4;font:bold 13px Arial,sans-serif;color:#9b504a;">Name</td><td style="padding:15px 0;border-bottom:1px solid #eaded4;font:15px Arial,sans-serif;color:#302c29;">${escapeHtml(fullName)}</td></tr>
              <tr><td style="padding:15px 8px 15px 0;border-bottom:1px solid #eaded4;font:bold 13px Arial,sans-serif;color:#9b504a;">Email</td><td style="padding:15px 0;border-bottom:1px solid #eaded4;font:15px Arial,sans-serif;"><a href="mailto:${safeEmail}" style="color:#302c29;text-decoration:underline;">${safeEmail}</a></td></tr>
              <tr><td style="padding:15px 8px 15px 0;border-bottom:1px solid #eaded4;font:bold 13px Arial,sans-serif;color:#9b504a;">Phone</td><td style="padding:15px 0;border-bottom:1px solid #eaded4;font:15px Arial,sans-serif;color:#302c29;">${escapeHtml(input.phone)}</td></tr>
              <tr><td style="padding:15px 8px 15px 0;border-bottom:1px solid #eaded4;font:bold 13px Arial,sans-serif;color:#9b504a;">Submitted</td><td style="padding:15px 0;border-bottom:1px solid #eaded4;font:15px Arial,sans-serif;color:#302c29;">${escapeHtml(submittedAt)} IST</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:8px 42px 34px;">
            <p style="margin:0 0 10px;font:bold 13px Arial,sans-serif;color:#9b504a;">Message</p>
            <div style="padding:20px;background:#fff5ea;border-left:3px solid #9b504a;font:15px/1.7 Arial,sans-serif;color:#3d3834;">${safeMessage}</div>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;"><tr><td bgcolor="#9b504a" style="background:#9b504a;"><a href="mailto:${safeEmail}" style="display:inline-block;padding:14px 26px;font:bold 13px Arial,sans-serif;letter-spacing:.7px;color:#ffffff;text-decoration:none;text-transform:uppercase;">Reply to ${escapeHtml(input.firstName)}</a></td></tr></table>
          </td></tr>
          <tr><td align="center" style="padding:23px 32px;background:#fff5ea;border-top:1px solid #eaded4;font:12px/1.6 Arial,sans-serif;color:#827973;">Ivory Muse &middot; Website contact notification</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
