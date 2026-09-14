import type { SelectedOption } from "./types";

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
