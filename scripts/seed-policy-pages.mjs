import { createClient } from "@sanity/client";
import { pathToFileURL } from "node:url";

let keyIndex = 0;
const key = (prefix) => `${prefix}-${++keyIndex}`;

function spanChildren(text) {
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const children = [];
  const markDefs = [];

  const appendText = (value, marks = []) => {
    let emailCursor = 0;
    for (const match of value.matchAll(emailPattern)) {
      const start = match.index ?? 0;
      if (start > emailCursor) {
        children.push({
          _type: "span",
          _key: key("span"),
          text: value.slice(emailCursor, start),
          marks,
        });
      }
      const markKey = key("email");
      markDefs.push({
        _type: "link",
        _key: markKey,
        href: `mailto:${match[0]}`,
        openInNewTab: false,
      });
      children.push({
        _type: "span",
        _key: key("span"),
        text: match[0],
        marks: [...marks, markKey],
      });
      emailCursor = start + match[0].length;
    }
    if (emailCursor < value.length) {
      children.push({
        _type: "span",
        _key: key("span"),
        text: value.slice(emailCursor),
        marks,
      });
    }
  };

  let cursor = 0;
  for (const match of text.matchAll(/\*\*(.+?)\*\*/g)) {
    const start = match.index ?? 0;
    appendText(text.slice(cursor, start));
    appendText(match[1], ["strong"]);
    cursor = start + match[0].length;
  }
  appendText(text.slice(cursor));
  return { children, markDefs };
}

export function parseBody(source) {
  const blocks = [];
  for (const raw of source.trim().split(/\n\s*\n/)) {
    const value = raw.trim();
    if (!value) continue;
    if (value.startsWith("## ") || value.startsWith("### ")) {
      const level = value.startsWith("### ") ? "h3" : "h2";
      const text = value.replace(/^#{2,3}\s+/, "");
      const { children, markDefs } = spanChildren(text);
      blocks.push({ _type: "block", _key: key("block"), style: level, markDefs, children });
      continue;
    }
    if (value.split("\n").every((line) => line.startsWith("- "))) {
      for (const line of value.split("\n")) {
        const { children, markDefs } = spanChildren(line.slice(2));
        blocks.push({ _type: "block", _key: key("block"), style: "normal", listItem: "bullet", level: 1, markDefs, children });
      }
      continue;
    }
    const text = value.replace(/\n/g, " ");
    const { children, markDefs } = spanChildren(text);
    blocks.push({ _type: "block", _key: key("block"), style: "normal", markDefs, children });
  }
  return blocks;
}

export const policies = [
  {
    _id: "policy.shipping",
    title: "Shipping & Delivery",
    navigationLabel: "Shipping",
    slug: "shipping-delivery",
    seoDescription: "Ivory Muse shipping, delivery, tracking and parcel information for Australian orders.",
    content: `
Ivory Muse offers delivery Australia-wide through **Australia Post**.

We take care when preparing and packaging each order.

## Delivery Timeframes

Once your order has been dispatched, delivery is estimated to take approximately **2–6 business days for standard shipping** and approximately **1-3 business days for express shipping**.

This depends on your location.

Delivery timeframes are estimates and may vary during peak periods, public holidays or due to delays experienced by Australia Post.

## Order Processing

As our fabrics are individually measured and cut to your selected length, please allow time for your order to be carefully prepared before dispatch.

You will receive confirmation once your order has been dispatched.

## Shipping Costs

Shipping costs will be displayed at checkout before you complete your purchase.

## Tracking Your Order

Once your order has been dispatched, tracking information will be sent to the email address provided with your order.

You can use this information to track the progress of your delivery through Australia Post.

## Delivery Address

Please ensure your delivery address is complete and correct before placing your order.

If you notice an error after placing your order, please contact us as soon as possible at **info@ivory-muse.com.au**

We will do our best to update your details if the order has not yet been dispatched. Once an order has been dispatched, we may not be able to change the delivery address.

## Delayed or Missing Parcels

If your parcel has not arrived within the expected delivery timeframe, please check your Australia Post tracking information first.

If you require further assistance, contact us at **info@ivory-muse.com.au** with your order number and we will assist with investigating the delivery.

## Parcels Damaged in Transit

If your parcel arrives damaged, please contact us as soon as possible at **info@ivory-muse.com.au**

Please include your order number and clear photographs of the parcel, packaging and affected fabric so our team can review the issue and assist you.

Please retain the original packaging while your enquiry is being reviewed.

## Contact

For questions regarding shipping or delivery, please contact:

**Ivory Muse**

**info@ivory-muse.com.au**`,
  },
  {
    _id: "policy.returns",
    title: "Returns & Refunds",
    navigationLabel: "Returns",
    slug: "returns-refunds",
    seoDescription: "Ivory Muse returns, refunds, faulty orders, cancellations and contact information.",
    content: `
At Ivory Muse, each fabric order is carefully prepared and cut to your selected length. Please review your fabric selection and quantity carefully before placing your order.

## Change of Mind

As our fabrics are cut specifically to your requested length, we do not accept returns, exchanges or refunds for change of mind once the fabric has been cut.

This includes ordering the incorrect quantity, changing your mind about the colour or fabric, or deciding the fabric is no longer suitable for your intended project.

Where available, we recommend ordering a swatch before purchasing a larger quantity.

## Faulty, Damaged or Incorrect Orders

If your fabric arrives faulty or damaged, you received an incorrect item, or there is another issue with your order, please contact us so we can review the matter and assist you.

We recommend inspecting your fabric upon arrival and before cutting, washing, sewing or otherwise altering it.

## Requesting a Return or Refund

All return and refund requests must first be submitted to Ivory Muse management by email at **info@ivory-muse.com.au**

Please include:

- Your full name
- Order number
- Reason for your request
- Clear photographs of the fabric or issue, where applicable

Our team will review your request and provide you with the appropriate next steps.

Please do not return any fabric to Ivory Muse unless you have first received return instructions from our team.

## Order Changes & Cancellations

If you need to change or cancel your order, please contact us as soon as possible.

If your fabric has not yet been cut, we may be able to amend or cancel your order. Once the fabric has been cut to your requested length, changes or cancellations may no longer be possible.

## Refunds

Where a refund is approved, it will be issued to the original payment method used for your purchase.

Processing times may vary depending on your bank or payment provider.

## Contact

For all return and refund enquiries:

**Ivory Muse Management**

**info@ivory-muse.com.au**`,
  },
  {
    _id: "policy.privacy",
    title: "Privacy Policy",
    navigationLabel: "Privacy Policy",
    slug: "privacy-policy",
    seoDescription: "How Ivory Muse collects, uses, stores and discloses personal information.",
    content: `
**Last updated: August 2026**

Ivory Muse respects your privacy and is committed to handling your personal information responsibly.

This Privacy Policy explains how we collect, use, store and disclose your personal information when you visit or use our website, make a purchase, join our mailing list, contact us or otherwise interact with Ivory Muse.

Please read this Privacy Policy carefully so you understand how your personal information may be handled when interacting with us.

## Personal Information We Collect

The personal information we collect will depend on how you interact with Ivory Muse and may include:

- **Contact details** — including your name, email address, phone number, billing address and delivery address.
- **Order and transaction information** — including products you view, add to your cart or purchase, your order history, returns, cancellations and transaction details.
- **Payment information** — including information required to process your payment. Payments are processed through the payment services available through our website.
- **Account information** — including account details, preferences and settings where customer accounts are available.
- **Communications with us** — including information you provide when contacting us about an order, product or other enquiry.
- **Marketing preferences** — including whether you have joined our mailing list or chosen to receive marketing communications.
- **Device information** — including information about your device, browser, network connection, IP address and similar identifiers.
- **Website usage information** — including information about how you browse, navigate and interact with our website.

## How We Collect Personal Information

We may collect personal information:

- **Directly from you** when you make a purchase, create an account, join our mailing list, complete a form, contact us or otherwise provide information to Ivory Muse.
- **Automatically** when you visit or interact with our website, including through cookies and similar technologies.
- **From service providers** that assist us in operating our website, processing transactions and providing our services.
- **From other third parties** where permitted and relevant to the operation of our business.

## How We Use Your Personal Information

### Provide & Improve Our Services

We may use your information to process payments and orders, arrange delivery, manage customer accounts, provide customer support, manage returns and other order enquiries, remember customer preferences and improve our website, products and overall customer experience.

### Marketing & Communications

Where you have chosen to receive marketing communications, we may use your information to send you Ivory Muse news, collection launches, product releases, journal content, offers and other relevant updates.

We may also use information about how customers interact with our website and communications to better understand our audience and improve our marketing.

### Security & Fraud Prevention

We may use personal information to help provide a secure shopping experience and to detect, investigate and prevent suspected fraudulent, unauthorised, illegal or malicious activity.

### Communicating With You

We may use your information to respond to enquiries, provide customer support and communicate with you about your orders, account or relationship with Ivory Muse.

### Legal & Business Requirements

We may use or retain personal information where reasonably necessary to comply with applicable laws, maintain business and transaction records, respond to lawful requests or protect our rights and interests.

## Email Marketing

If you join our waitlist, subscribe to our mailing list or otherwise choose to receive marketing communications, we may send you emails relating to Ivory Muse, our collections, products, journal and other updates.

You can unsubscribe from marketing emails at any time by using the unsubscribe link included in our emails.

If you unsubscribe from marketing communications, we may still send you non-promotional communications where necessary, such as order confirmations, delivery information or communications relating to a purchase you have made.

## Cookies & Similar Technologies

Our website may use cookies and similar technologies to operate and improve the website, remember preferences and understand how visitors interact with our services.

Cookies and similar technologies may also be used for analytics, website performance and marketing purposes depending on the services and technologies used on our website.

You may be able to manage certain cookies through your browser or device settings.

## How We Disclose Personal Information

We may disclose personal information to third parties where reasonably necessary to operate Ivory Muse and provide our services.

This may include:

- Ecommerce and website technology providers
- Payment processors
- Delivery and fulfilment providers
- Website hosting and cloud service providers
- Email and marketing platforms
- Analytics and website performance providers
- Customer service and business technology providers
- Professional advisers where necessary

We may also disclose information where you direct or consent to us doing so, or where disclosure is required or permitted by law.

We do not sell your personal information.

## Relationship With Shopify

Shopify forms part of the ecommerce infrastructure used by Ivory Muse.

Shopify may collect and process personal information relating to your access to and use of our store in order to provide ecommerce services, facilitate transactions and support the operation of our online store.

Information you provide when interacting with our store may therefore be transmitted to or processed by Shopify and relevant service providers.

Shopify maintains its own privacy practices regarding the personal information it processes through its services.

## Third-Party Services & Links

Our website may contain links to websites, social media platforms or other online services operated by third parties.

Third-party websites and services operate under their own terms and privacy practices. Ivory Muse is not responsible for the privacy or security practices of websites or platforms that we do not operate or control.

We recommend reviewing the relevant privacy policy before providing personal information to a third-party service.

## Security of Your Information

We take reasonable steps to protect personal information from misuse, interference, loss, unauthorised access, modification and disclosure.

However, no method of transmitting or storing information electronically can be guaranteed to be completely secure.

We recommend that you do not send sensitive payment or confidential information to us through unsecured communication channels.

## Retention of Personal Information

We retain personal information for as long as reasonably necessary for the purpose for which it was collected.

The length of time information is retained may depend on factors such as maintaining your account, providing our services, keeping appropriate transaction and business records, resolving disputes and meeting applicable legal obligations.

When personal information is no longer reasonably required, we will take appropriate steps in relation to its retention or disposal.

## Access & Correction

You may contact us to request access to personal information we hold about you or to ask us to correct information that is inaccurate or out of date.

We may need to verify your identity before responding to certain requests.

## Managing Your Communication Preferences

You can opt out of receiving promotional emails from Ivory Muse at any time by using the unsubscribe link provided in our marketing emails.

Opting out of promotional communications does not prevent us from contacting you about an existing order, transaction or other necessary customer service matter.

## Overseas Processing

Some of the service providers and technology platforms used by Ivory Muse may store or process information outside Australia.

As a result, personal information may be transferred to or processed in other countries as part of providing our website, ecommerce, payment, communication or technology services.

The countries involved may depend on the service providers used by Ivory Muse from time to time.

## Privacy Enquiries & Complaints

If you have a question or concern about how we collect, use or handle your personal information, please contact us using the details below.

Please provide enough information for us to understand your enquiry or complaint.

We will review the matter and aim to respond within a reasonable timeframe.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes to our website, technology, services, business practices or applicable requirements.

When we update this policy, the revised version will be published on our website and the **Last updated** date will be changed accordingly.

## Contact

If you have any questions about this Privacy Policy, would like to request access to or correction of your personal information, or would like to make a privacy complaint, please contact:

**Ivory Muse**

**Email:**info@ivory-muse.com.au`,
  },
  {
    _id: "policy.terms",
    title: "Terms & Conditions",
    navigationLabel: "Terms & Conditions",
    slug: "terms-conditions",
    seoDescription: "Terms governing use of the Ivory Muse website and purchases through the online store.",
    content: `
These Terms & Conditions apply to the use of the Ivory Muse website and purchases made through our online store.

By using our website or placing an order, you agree to these terms.

## Products & Fabric Information

We take care to provide accurate descriptions, photographs and information about our fabrics.

Product specifications, including composition, width, weight or momme, colour and finish, are provided on the individual product page where applicable.

Please review the product information carefully before placing your order.

## Colour & Fabric Variations

We make every effort to represent our fabrics accurately. However, colours may appear slightly different depending on lighting, photography, screen settings and individual devices.

Silk and natural fibres may also have subtle variations in texture, lustre and appearance.

Where available, we recommend ordering a swatch if colour, texture or finish is particularly important to your project.

## Fabric Quantities

The unit in which each fabric is sold will be clearly displayed on the product page.

Customers are responsible for confirming the quantity required for their project before ordering.

Where multiple metres of the same fabric are ordered, we will aim to provide the fabric in one continuous length wherever possible.

## Pricing & Payment

All prices are displayed in **Australian dollars (AUD)** and include GST where applicable.

Payment must be completed using one of the payment methods available at checkout.

Prices may change from time to time. Any changes will not affect orders that have already been confirmed.

## Orders

Once an order has been successfully placed, you will receive an order confirmation.

We may cancel or decline an order if a product is unavailable, there is an obvious pricing or product information error, we cannot fulfil the quantity requested, or we reasonably suspect fraudulent or unauthorised activity.

If payment has already been received for an order we cancel, the applicable amount will be refunded.

## Product Suitability

Suggested uses for our fabrics are provided as general guidance.

The suitability of a fabric will depend on your individual design, pattern and intended use. We recommend seeking professional advice where necessary before purchasing fabric for a specific project.

## Intellectual Property

All Ivory Muse branding, photographs, written content, graphics and original website material are owned by or licensed to Ivory Muse.

Our content may not be copied, reproduced or used for commercial purposes without prior written permission.

## Your Consumer Rights

Nothing in these Terms & Conditions limits any rights that cannot lawfully be excluded under applicable Australian consumer law.

## Changes to These Terms

We may update these Terms & Conditions from time to time. The latest version will be available on our website.

## Contact

For questions regarding these Terms & Conditions, please contact:

**Ivory Muse**

**info@ivory-muse.com.au**`,
  },
];

async function seedPolicies() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-01";

  if (!projectId || !token) {
    throw new Error("Sanity project ID and write token are required.");
  }

  const client = createClient({ projectId, dataset, token, apiVersion, useCdn: false });
  for (const policy of policies) {
    await client.createOrReplace({
      _id: policy._id,
      _type: "policyPage",
      title: policy.title,
      navigationLabel: policy.navigationLabel,
      slug: { _type: "slug", current: policy.slug },
      seoDescription: policy.seoDescription,
      body: parseBody(policy.content),
    });
    console.log(`Seeded ${policy.title}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seedPolicies();
}
