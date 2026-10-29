import type { Product, ProductVariant } from "./types";

const SATIN_ORGANZA_HANDLE = "satin-organza";
const MOMME_PATTERN = /\b(\d+(?:\.\d+)?)\s*mm\b/i;
const WEIGHT_MOMME_PATTERN = /\(\s*\d+(?:\.\d+)?\s*mm\s*\)/i;

function selectedMomme(variant?: ProductVariant) {
  for (const option of variant?.selectedOptions || []) {
    const match = option.value.match(MOMME_PATTERN);
    if (match) return `${match[1]}mm`;
  }
  return null;
}

export function displayFabricWeight(product: Product, variant?: ProductVariant) {
  const weight = product.fabricWeight?.value.trim();
  if (!weight || product.handle !== SATIN_ORGANZA_HANDLE) return weight;

  const momme = selectedMomme(variant);
  if (!momme) return weight;

  return WEIGHT_MOMME_PATTERN.test(weight)
    ? weight.replace(WEIGHT_MOMME_PATTERN, `(${momme})`)
    : `${weight} (${momme})`;
}
