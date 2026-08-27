import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "./client";
const builder = createImageUrlBuilder(sanityClient);
export function sanityImageUrl(source: SanityImageSource, width = 3200) {
  return builder.image(source).width(width).quality(95).auto("format").url();
}
