import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

await client
  .patch("aboutPage")
  .set({
    'sections[_key=="hero"].heading': "The Art of Silk",
    'sections[_key=="hero"].body':
      "For centuries, silk has been admired for its beauty, treasured for its craftsmanship and chosen for creations that stand the test of time.",
    'sections[_key=="hero"].primaryLabel': "Shop the Collection",
    'sections[_key=="hero"].secondaryLabel': "Discover Ivory Muse",
    'sections[_key=="why"].heading': "WHY IVORY MUSE",
    'sections[_key=="why"].body':
      "Choosing fabric is more than selecting a colour or texture. It is the beginning of every creative journey.\n\nAt Ivory Muse, we believe the experience of sourcing fabric should be as considered as the designs it inspires. Our collection is intentionally curated to offer premium mulberry silk fabrics of exceptional quality, allowing designers, dressmakers and creators to focus on bringing their vision to life with confidence.\n\nWe value craftsmanship over quantity, thoughtful selection over endless choice, and timeless elegance over passing trends. Every fabric is chosen for its beauty, character and versatility, creating a collection that feels refined, cohesive and enduring.",
    'sections[_key=="values"].items[_key=="curated"].title':
      "Thoughtfully Curated",
    'sections[_key=="values"].items[_key=="curated"].body':
      "Rather than offering an overwhelming catalogue, we present a carefully considered collection where every fabric has earned its place. Each selection reflects our commitment to quality, beauty and timeless design.",
    'sections[_key=="values"].items[_key=="mulberry"].title':
      "Premium Mulberry Silk",
    'sections[_key=="values"].items[_key=="mulberry"].body':
      "We specialise in premium mulberry silk chosen for its exceptional drape, natural lustre and enduring performance, providing a foundation for creations that are made to be admired.",
    'sections[_key=="values"].items[_key=="experience"].title':
      "A Refined Experience",
    'sections[_key=="values"].items[_key=="experience"].body':
      "From browsing our collections to receiving your order, every detail is designed to offer a seamless and elevated experience that reflects the quality of the fabrics themselves.",
    'sections[_key=="values"].items[_key=="creators"].title':
      "Created for Designers & Creators",
    'sections[_key=="values"].items[_key=="creators"].body':
      "Whether you are designing a bespoke gown, crafting an heirloom piece, styling a luxury event or creating for the home, our fabrics are selected to support creativity without compromise.",
    'sections[_key=="nature"].heading': "Nature’s Most Refined Fibre",
    'sections[_key=="nature"].sectionName': "Nature’s Most Refined Fibre",
    'sections[_key=="nature"].image.alt': "Nature’s Most Refined Fibre",
    'sections[_key=="nature"].body':
      "For centuries, mulberry silk has been treasured by artisans, designers and couturiers for its unparalleled beauty and remarkable performance.\n\nIts luminous finish, graceful drape and enduring strength have made it the fabric of choice for creations that are intended to be remembered.\n\nMore than a textile, silk is an experience—one that transforms the way a garment moves, a space feels and a vision comes to life.",
    'sections[_key=="nature"].items[_key=="elegant"].title':
      "Naturally Elegant",
    'sections[_key=="nature"].items[_key=="elegant"].body':
      "A soft lustre, fluid drape and refined finish create garments and interiors of understated sophistication.",
    'sections[_key=="nature"].items[_key=="breathable"].title':
      "Beautifully Breathable",
    'sections[_key=="nature"].items[_key=="breathable"].body':
      "Lightweight and naturally temperature regulating, mulberry silk offers exceptional comfort throughout the seasons.",
    'sections[_key=="nature"].items[_key=="strong"].title':
      "Remarkably Strong",
    'sections[_key=="nature"].items[_key=="strong"].body':
      "Delicate in appearance yet remarkably resilient, silk combines enduring strength with effortless grace.",
    'sections[_key=="nature"].items[_key=="timeless"].title':
      "Timeless by Nature",
    'sections[_key=="nature"].items[_key=="timeless"].body':
      "True luxury is never defined by trends. Silk has remained one of the world’s most admired fibres for generations, celebrated for its enduring beauty and craftsmanship.",
    'sections[_key=="vision"].heading': "Designed to Inspire Every Vision",
    'sections[_key=="vision"].body':
      "From couture ateliers to beautifully styled interiors, premium mulberry silk brings elegance, movement and refinement to every creative expression.\n\nWhether your vision is worn, celebrated or lived within, our carefully curated collection provides the foundation for exceptional work.",
    'sections[_key=="vision"].cards[_key=="events"].title': "Event Styling",
    'sections[_key=="vision"].cards[_key=="events"].body':
      "Create unforgettable environments through flowing silk drapery, refined table settings, ceremony installations and elevated event décor that leave a lasting impression.",
    'sections[_key=="vision"].cards[_key=="events"].linkLabel':
      "Explore Fabrics",
    'sections[_key=="vision"].cards[_key=="bridal"].title': "Bridal Couture",
    'sections[_key=="vision"].cards[_key=="bridal"].body':
      "Craft wedding gowns, veils and couture pieces that celebrate life’s most meaningful moments with elegance and sophistication.",
    'sections[_key=="vision"].cards[_key=="bridal"].linkLabel':
      "Explore Fabrics",
    'sections[_key=="vision"].cards[_key=="interiors"].title':
      "Home & Interiors",
    'sections[_key=="vision"].cards[_key=="interiors"].body':
      "Transform living spaces with the timeless beauty of premium mulberry silk. From luxurious bedding and bespoke cushions to elegant window furnishings,",
    'sections[_key=="vision"].cards[_key=="interiors"].linkLabel':
      "Explore Fabrics",
    'sections[_key=="vision"].cards[_key=="fashion"].title':
      "Fashion & Dressmaking",
    'sections[_key=="vision"].cards[_key=="fashion"].body':
      "Create garments distinguished by graceful movement, luxurious texture and timeless appeal",
    'sections[_key=="vision"].cards[_key=="fashion"].linkLabel':
      "Explore Fabrics",
  })
  .commit();

const aboutPage = await client.fetch('*[_id == "aboutPage"][0]');
const questionMarkFields = [];

function findQuestionMarks(value, path = "") {
  if (typeof value === "string" && value.includes("?")) {
    questionMarkFields.push({ path, value });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => findQuestionMarks(entry, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) =>
      findQuestionMarks(entry, path ? `${path}.${key}` : key),
    );
  }
}

findQuestionMarks(aboutPage);

if (questionMarkFields.length > 0) {
  console.error(JSON.stringify(questionMarkFields, null, 2));
  process.exitCode = 1;
} else {
  console.log(`About page updated: ${aboutPage._rev}`);
  console.log("Question marks remaining in About content: 0");
}
