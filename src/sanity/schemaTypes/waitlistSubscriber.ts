import { defineField, defineType } from "sanity";

export const waitlistSubscriber = defineType({
  name: "waitlistSubscriber",
  title: "Waitlist subscriber",
  type: "document",
  fields: [
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "marketingConsent", title: "Marketing consent", type: "boolean", readOnly: true }),
    defineField({ name: "tag", title: "Tag", type: "string", readOnly: true }),
    defineField({ name: "source", title: "Source", type: "string", readOnly: true }),
    defineField({ name: "subscribedAt", title: "Subscribed at", type: "datetime", readOnly: true }),
    defineField({ name: "welcomeEmailSent", title: "Welcome email sent", type: "boolean", readOnly: true }),
  ],
  preview: { select: { title: "email", subtitle: "subscribedAt" } },
});
