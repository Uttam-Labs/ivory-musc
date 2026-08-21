import { defineField, defineType } from "sanity";
import { ColorPickerInput } from "../components/color-picker-input";

const legacyFieldOptions = { hidden: true, readOnly: true } as const;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Default settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site title", type: "string" }),
    defineField({ name: "description", title: "SEO description", type: "text", rows: 3 }),
    defineField({ name: "titleTemplate", title: "Page title template", description: "Use %s where the page title should appear. Example: %s | Ivory Muse", type: "string", initialValue: "%s | Ivory Muse", validation: (rule) => rule.custom((value) => !value || value.includes("%s") || "Title template must contain %s") }),
    defineField({ name: "favicon", title: "Favicon", description: "Upload a square PNG, recommended size 512 × 512px.", type: "image" }),
    defineField({ name: "socialImage", title: "Default social sharing image", description: "Used when a page has no own share image. Recommended size 1200 × 630px.", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alt text", type: "string" })] }),
    defineField({ name: "keywords", title: "Default SEO keywords", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "locale", title: "Site locale", description: "Open Graph locale, for example en_AU.", type: "string", initialValue: "en_AU" }),
    defineField({ name: "themeColor", title: "Browser theme color", type: "string", initialValue: "#FFF9F3", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
    defineField({ name: "allowIndex", title: "Allow search engines to index the site", type: "boolean", initialValue: true }),
    defineField({ name: "allowFollow", title: "Allow search engines to follow links", type: "boolean", initialValue: true }),
    defineField({
      name: "theme",
      title: "Default fonts, colors and typography",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "headingFont", title: "Heading font family", type: "string", initialValue: '"Times New Roman", Times, serif' }),
        defineField({ name: "bodyFont", title: "Body font family", type: "string", initialValue: "Arial, Helvetica, sans-serif" }),
        defineField({ name: "background", title: "Page background color", type: "string", initialValue: "#FFF9F3", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "surface", title: "Alternate surface color", description: "Used for light cards and split-section backgrounds.", type: "string", initialValue: "#FFF5EA", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "foreground", title: "Primary text color", type: "string", initialValue: "#333333", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "accent", title: "Heading, link and button color", type: "string", initialValue: "#9B504A", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "pdpText", title: "Product details secondary text color", type: "string", initialValue: "#706E6E", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "white", title: "White color", type: "string", initialValue: "#FFFFFF", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "black", title: "Black color", type: "string", initialValue: "#000000", components: { input: ColorPickerInput }, validation: (rule) => rule.regex(/^#[0-9a-f]{6}$/i, { name: "hex color" }) }),
        defineField({ name: "bodyFontSize", title: "Body font size (px)", type: "number", initialValue: 18, validation: (rule) => rule.min(12).max(28) }),
        defineField({ name: "buttonFontSize", title: "Button and link font size (px)", type: "number", initialValue: 16, validation: (rule) => rule.min(10).max(24) }),
        defineField({ name: "bodyLineHeight", title: "Body line height", type: "number", initialValue: 1.5, validation: (rule) => rule.min(1).max(2.5) }),
        defineField({ name: "commonHeadingSize", title: "Common heading responsive size", description: "CSS value used by .common-heading.", type: "string", initialValue: "clamp(2.6rem, 2vw, 3rem)" }),
      ],
    }),
    // Preserve older documents without showing duplicate footer controls.
    defineField({ name: "contactEmail", title: "Legacy contact email", type: "string", ...legacyFieldOptions }),
    defineField({ name: "copyright", title: "Legacy copyright", type: "string", ...legacyFieldOptions }),
    defineField({ name: "facebookUrl", title: "Legacy Facebook URL", type: "url", ...legacyFieldOptions }),
    defineField({ name: "instagramUrl", title: "Legacy Instagram URL", type: "url", ...legacyFieldOptions }),
    defineField({ name: "logo", title: "Legacy logo", type: "image", ...legacyFieldOptions }),
    defineField({
      name: "navigation",
      title: "Legacy navigation",
      type: "array",
      ...legacyFieldOptions,
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "href", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "footerColumns",
      title: "Legacy footer columns",
      type: "array",
      ...legacyFieldOptions,
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "heading", type: "string" }),
            defineField({
              name: "links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", type: "string" }),
                    defineField({ name: "href", type: "string" }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
});
