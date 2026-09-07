import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { basename, resolve } from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-01";
if (!projectId || !token) throw new Error("Sanity project ID and write token are required.");
const client = createClient({ projectId, dataset, token, apiVersion, useCdn: false });
const keyed = (items, prefix) => items.map((item, index) => ({ _key: `${prefix}-${index + 1}`, _type: "object", ...item }));

async function image(path, alt) {
  const filename = basename(path);
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`, { filename });
  const asset = existing ? { _id: existing } : await client.assets.upload("image", createReadStream(path), { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt };
}

const heroImage = await image(resolve("public/figma/silk-satin.jpg"), "Ivory silk satin folds");
const understandingImage = await image(resolve("public/figma/silk-organza.jpg"), "Ivory silk fabric folds");
const guideImage = await image(resolve("public/figma/campaign.jpg"), "Floral silk fabric detail");

const characteristics = keyed([
  { title: "Momme", body: "Momme, often abbreviated as mm, is a traditional measurement used to describe the weight of silk fabric.\n\nGenerally, a lower momme indicates a lighter fabric, while a higher momme indicates a heavier or more substantial fabric.\n\nMomme is useful, but it does not tell the whole story. The weave and construction of a fabric can dramatically influence how it feels and behaves.\n\nAlways consider momme alongside the fabric’s drape, structure, transparency and finish." },
  { title: "Drape", body: "Drape describes the way a fabric falls and moves. A fluid fabric falls softly around the body, while a structured fabric holds its shape and creates volume or definition." },
  { title: "Lustre", body: "Lustre describes the way a fabric reflects light. Some fabrics have a luminous, glossy surface, while others have a softer or understated finish." },
  { title: "Structure", body: "Structure refers to how well a fabric holds its shape. Structured fabrics suit sculptural silhouettes, statement details and designs where volume must be maintained." },
  { title: "Transparency", body: "Silk can range from sheer and almost weightless to substantially more opaque. Transparency matters when considering layering, lining and garment construction." },
  { title: "Texture", body: "Not all silk is perfectly smooth. Textured, crisp, creped or crinkled finishes add depth and dimension to a design." },
], "characteristic");

const fabricRows = [
  ["Mulberry Silk Satin","Smooth, luminous and beautifully fluid.","An elegant sheen and graceful drape create a refined, flowing silhouette.","Smooth · Luminous · Fluid","Dresses, gowns, skirts, blouses and eveningwear."],
  ["Crepe Satin","Fluid and elegant with a refined finish.","A lustrous face and softly textured reverse offer versatility.","Fluid · Refined · Softly lustrous","Dresses, gowns, skirts, blouses and eveningwear."],
  ["Stretch Silk Satin","Satin lustre with added flexibility.","Suited to movement, comfort and a closer fit.","Smooth · Fluid · Flexible","Fitted dresses, bias silhouettes, skirts and blouses."],
  ["Duchess Satin","Substantial, smooth and structured.","Its greater body creates defined silhouettes that hold shape.","Smooth · Substantial · Structured","Structured gowns, formalwear, corsetry and statement pieces."],
  ["Dupion Silk","Distinctive, crisp and naturally textural.","Its signature surface and structured character hold shape beautifully.","Crisp · Textured · Structured","Dresses, gowns, skirts, jackets and decorative applications."],
  ["Habotai","Light, smooth and beautifully soft.","A delicate hand and lightweight drape without unnecessary weight.","Lightweight · Smooth · Soft","Linings, lightweight garments, scarves and layering."],
  ["Organza","Sheer, crisp and remarkably structured.","Creates volume without heaviness for layered and sculptural designs.","Sheer · Crisp · Structured","Overlays, sleeves, volume and structured gowns."],
  ["Georgette","Lightweight, softly textured and fluid.","Graceful movement balances softness, texture and transparency.","Lightweight · Textured · Flowing","Dresses, skirts, blouses, sleeves and overlays."],
  ["Satin Chiffon","Delicate, flowing and softly luminous.","Airy chiffon movement meets a refined surface lustre.","Lightweight · Flowing · Softly lustrous","Dresses, overlays, sleeves, scarves and layers."],
  ["Crinkle Chiffon","Airy, textured and full of movement.","A crinkled surface adds dimension while remaining light and flowing.","Lightweight · Textured · Flowing","Dresses, skirts, sleeves, overlays and layers."],
  ["Silk Mesh","Sheer and delicate with an open construction.","Introduces transparency and texture alone or when layered.","Sheer · Lightweight · Delicate","Panels, sleeves, overlays and design details."],
  ["Silk Midako","A distinctive Ivory Muse silk.","Refer to its product page for exact composition, finish and characteristics.","Product-specific","Uses depend on the individual fabric specification."],
];
const fabrics = keyed(fabricRows.map(([title, tagline, body, character, considerFor]) => ({ title, tagline, body, character, considerFor })), "fabric");
const finderCards = keyed([
  { title: "Fluidity & Movement", body: "These fabrics are suited to designs where graceful movement and drape are central to the silhouette.", fabrics: ["Mulberry Silk Satin", "Crepe Satin", "Stretch Silk Satin"] },
  { title: "Structure & Shape", body: "These fabrics offer greater body and are suited to designs requiring definition, volume or structure.", fabrics: ["Duchess Satin", "Dupion Silk", "Organza"] },
  { title: "Light & Delicate", body: "Consider these when softness and lightness are important to your design.", fabrics: ["Habotai", "Georgette"] },
  { title: "Sheer & Flowing", body: "These fabrics can introduce softness, transparency and movement, particularly when layered.", fabrics: ["Georgette", "Satin Chiffon", "Crinkle Chiffon"] },
  { title: "Sheer Structure", body: "Organza offers the unusual combination of transparency and structure, making it particularly suited to sculptural and layered designs.", fabrics: ["Organza"] },
  { title: "Texture", body: "Texture can introduce depth and visual interest without relying solely on colour or print.", fabrics: ["Dupion Silk", "Georgette", "Crinkle Chiffon", "Silk Mesh"] },
], "finder");
const guideSections = keyed([
  { navigationLabel:"Choosing Your Silk", heading:"Choosing Your Silk", body:"Start With Your Design\n\nThink first about how you want the finished piece to behave. These questions will help narrow your selection.", bullets:["Do you want it to fall softly against the body?","Do you want the fabric to hold volume?","Should it feel light and sheer?","Do you want a luminous surface or something understated?"], notes:keyed([{eyebrow:"Step 1",title:"Review the Product Details",body:"Consult the product page for composition, width, weight or momme, finish and care information."},{eyebrow:"Step 2",title:"Consider a Swatch",body:"Where available, order a swatch when colour, texture, weight, transparency or drape is important."}],"choosing-note") },
  { navigationLabel:"Understanding Colour", heading:"Understanding Colour", body:"Silk interacts beautifully with light, so its appearance can change with its surroundings. Online colours may vary with photography, lighting, screen settings and devices.\n\nDifferences may also occur between dye or production lots. For consistent colour, order the full quantity at the same time." },
  { navigationLabel:"Working With Silk", heading:"Working With Silk", body:"Silk rewards considered preparation. Before cutting, inspect the fabric and confirm its type, colour and quantity. Lightweight fabrics can move during construction, so careful preparation improves precision.\n\nFor complex designs or unfamiliar fabrics, consult an experienced dressmaker, tailor or pattern maker." },
  { navigationLabel:"Caring for Silk", heading:"Caring for Silk", body:"Different fabrics require different care. Always follow the instructions for your chosen Ivory Muse fabric.", bullets:["Handle fabric with clean, dry hands.","Avoid bleach, harsh chemicals and excessive heat.","Protect fabric from prolonged direct sunlight.","Store fabric in a clean, dry environment.","Press only at a suitable low temperature.","Follow professional dry-cleaning instructions where specified.","Test unfamiliar methods on a swatch first."] },
  { navigationLabel:"Natural Characteristics", heading:"Natural Characteristics", body:"Silk is a natural fibre, and subtle variations may form part of its character. Variations in texture, lustre and appearance can occur. Always review the individual product description." },
  { navigationLabel:"Before You Order", heading:"Before You Order", body:"Before purchasing fabric for your project, we recommend:", bullets:["Review the full product description.","Check composition and width.","Review momme or weight where provided.","Consider drape and transparency.","Check care instructions.","Confirm the quantity required.","Order a swatch where appropriate."], notes:keyed([{title:"Cut fabric returns",body:"Fabric cut to your requested length generally cannot be returned for change of mind. See our Returns & Refunds Policy."}],"order-note") },
  { navigationLabel:"A Note on Our Guide", heading:"A Note on Our Silk Guide", body:"This guide provides general information. Characteristics and suitability vary with product, composition, weave, weight, finish, pattern, construction and intended use.\n\nDescriptions, suggested uses, care and sewing information are general guidance only. Review the product page and consider professional advice. Nothing in this guide modifies rights under Australian Consumer Law." },
], "guide");

const document = {
  _type: "silkGuidePage", title: "Silk Guide", seoTitle: "Silk Guide", seoDescription: "Discover silk characteristics, fabric types, care and guidance for choosing the right silk.",
  sectionVisibility: { hero:true, introduction:true, art:true, understanding:true, fabrics:true, finder:true, detailedGuide:true, cta:true },
  hero: { image: heroImage, heading: "Silk Guide", tagline: "Discover the character, movement and beauty of silk." },
  introduction: "Silk is a material defined by contrast. It can be fluid or structured, luminous or understated, sheer or substantial. Understanding these differences can help you choose a fabric that not only looks beautiful, but behaves the way your design requires. The Ivory Muse Silk Guide introduces the qualities that shape a fabric—from weave and drape to lustre and transparency—and helps you explore our collection with confidence.",
  art: { image: heroImage, eyebrow: "The Art of Silk", heading: "What Is Mulberry Silk?", body: "Mulberry silk is one of the most recognised forms of cultivated silk and is valued for its fine, long fibres, smooth feel and natural lustre.\n\nThe character of the finished fabric is influenced not only by the fibre itself, but by the way it is woven and finished.\n\nThis is why silk can take so many forms—from the fluidity of satin to the crisp structure of organza and the delicate transparency of chiffon." },
  understanding: { heading: "Understanding Silk", introduction: "Before choosing a fabric, there are a few characteristics worth understanding.", image: understandingImage, characteristics },
  fabricsHeading: "Explore Our Silks", fabricsIntroduction: "Each fabric has its own character. Compare how it moves, reflects light and holds its shape.", considerForLabel: "Consider for:", fabrics,
  finder: { heading: "Find Your Silk", introduction: "Not sure where to begin?\nStart with the way you want your finished piece to look and move.", cards: finderCards },
  guideImage, guideSections,
  cta: { eyebrow:"Begin With the Material", heading:"Exceptional creations begin with exceptional materials.", body:"Explore the Ivory Muse collection and discover the silk for your next creation.", buttonLabel:"Explore the Collection", buttonHref:"/collections/shop" },
};

await client.createOrReplace({ _id: "silkGuidePage", ...document });
await client.createOrReplace({ _id: "drafts.silkGuidePage", ...document });
const verification = await client.fetch(`*[_id in ["silkGuidePage", "drafts.silkGuidePage"]] | order(_id asc){
  _id,
  title,
  "characteristics": count(understanding.characteristics),
  "fabrics": count(fabrics),
  "finderCards": count(finder.cards),
  "guideSections": count(guideSections)
}`);
console.log("Seeded and verified Silk Guide documents:", verification);
