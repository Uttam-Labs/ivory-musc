import type { SelectedOption } from "./types";

type CartAttribute = { key: string; value: string };

export function formatCentimetres(value: string) {
  return value.replace(/(\d)\s*cm\b/gi, "$1 CM");
}

export function formatCartVariantTitle(
  selectedOptions: SelectedOption[] | undefined,
  fallbackTitle: string,
) {
  const options = (selectedOptions || []).filter((option) => option.name !== "Title");
  if (options.length) {
    return options
      .map((option) => /width/i.test(option.name) ? formatCentimetres(option.value) : option.value)
      .join(" / ");
  }
  return fallbackTitle
    .split("/")
    .map((part) => formatCentimetres(part.trim()))
    .join(" / ");
}

export function formatCartAttributeValue(key: string, value: string) {
  return /width/i.test(key) ? formatCentimetres(value) : value;
}

export function cartAttribute(attributes: CartAttribute[], key: string) {
  return attributes.find((attribute) => attribute.key.toLowerCase() === key.toLowerCase())?.value?.trim() || "";
}

export function isSampleAttributes(attributes: CartAttribute[]) {
  return cartAttribute(attributes, "type").toLowerCase() === "sample";
}

export function sampleDisplayTitle(attributes: CartAttribute[]) {
  const product = cartAttribute(attributes, "Main Product");
  return product ? `${product} Sample` : "Fabric Sample";
}

export function sampleVariantTitle(attributes: CartAttribute[]) {
  return attributes
    .filter(({ key, value }) => value.trim() && !["type", "main product"].includes(key.toLowerCase()) && !key.startsWith("_"))
    .map(({ key, value }) => formatCartAttributeValue(key, value))
    .join(" / ");
}
