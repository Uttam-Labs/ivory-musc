import { defineArrayMember, defineField, defineType } from "sanity";

const imageField = defineField({
  name: "image",
  title: "Background image",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
});

export const blogPage = defineType({
  name: "blogPage",
  title: "Blog page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "SEO title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "array",
      validation: (rule) => rule.max(2),
      of: [
        defineArrayMember({
          name: "blogHero",
          title: "Blog banner",
          type: "object",
          fields: [
            defineField({ name: "enabled", title: "Show hero", type: "boolean", initialValue: true }),
            imageField,
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "overlayOpacity", title: "Dark overlay (%)", type: "number", initialValue: 15, validation: (rule) => rule.min(0).max(100) }),
          ],
          preview: { select: { media: "image" }, prepare: ({ media }) => ({ title: "Blog banner", subtitle: "Banner image, heading and description", media }) },
        }),
        defineArrayMember({
          name: "blogListingSettings",
          title: "Blog articles",
          type: "object",
          fields: [
            defineField({
              name: "shopifyBlogHandle",
              title: "Shopify blog handle",
              type: "string",
              description: "Enter the Shopify blog handle to display (for example: news). Leave blank to display articles from every published blog.",
            }),
            defineField({ name: "heading", title: "Section heading", type: "string" }),
            defineField({ name: "allLabel", title: "All filter label", type: "string" }),
            defineField({ name: "searchPlaceholder", title: "Search placeholder", type: "string" }),
            defineField({ name: "recentHeading", title: "Recent articles heading", type: "string" }),
            defineField({ name: "readMoreLabel", title: "Read more label", type: "string" }),
            defineField({ name: "emptyMessage", title: "No results message", type: "string" }),
            defineField({ name: "articlesPerPage", title: "Articles per page", type: "number", initialValue: 6, validation: (rule) => rule.min(2).max(24).integer() }),
            defineField({ name: "recentLimit", title: "Maximum recent articles", type: "number", initialValue: 7, validation: (rule) => rule.min(1).max(12).integer() }),
            defineField({
              name: "listingVisibility",
              title: "Blog listing visibility",
              type: "object",
              options: { collapsible: true, collapsed: false },
              fields: [
                defineField({ name: "showHeading", title: "Show section heading", type: "boolean", initialValue: true }),
                defineField({ name: "showFilters", title: "Show tag filters", type: "boolean", initialValue: true }),
                defineField({ name: "showSearch", title: "Show search", type: "boolean", initialValue: true }),
                defineField({ name: "showRecent", title: "Show recent articles", type: "boolean", initialValue: true }),
                defineField({ name: "showImages", title: "Show article images", type: "boolean", initialValue: true }),
                defineField({ name: "showDates", title: "Show article dates", type: "boolean", initialValue: true }),
                defineField({ name: "showExcerpts", title: "Show article excerpts", type: "boolean", initialValue: true }),
                defineField({ name: "showReadMore", title: "Show read more links", type: "boolean", initialValue: true }),
                defineField({ name: "showPagination", title: "Show pagination", type: "boolean", initialValue: true }),
              ],
            }),
            defineField({
              name: "articleVisibility",
              title: "Article details visibility",
              type: "object",
              hidden: true,
              options: { collapsible: true, collapsed: false },
              fields: [
                defineField({ name: "showBreadcrumbs", title: "Show breadcrumbs", type: "boolean", initialValue: true }),
                defineField({ name: "showBlogName", title: "Show Shopify blog name", type: "boolean", initialValue: true }),
                defineField({ name: "showDate", title: "Show published date", type: "boolean", initialValue: true }),
                defineField({ name: "showFeaturedImage", title: "Show featured image", type: "boolean", initialValue: true }),
                defineField({ name: "showTags", title: "Show tags", type: "boolean", initialValue: true }),
                defineField({ name: "showRecent", title: "Show recent articles", type: "boolean", initialValue: true }),
                defineField({ name: "showBackLink", title: "Show back to blog link", type: "boolean", initialValue: true }),
              ],
            }),
            defineField({ name: "articleRecentHeading", title: "Article page recent heading", type: "string", initialValue: "Recent articles", hidden: true }),
            defineField({ name: "articleBackLabel", title: "Article page back link label", type: "string", initialValue: "Back to all articles", hidden: true }),
          ],
          preview: { prepare: () => ({ title: "Blog articles", subtitle: "Shopify blog, filters, search and pagination" }) },
        }),
      ],
    }),
  ],
});
