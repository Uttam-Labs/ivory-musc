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

export function cartVariantDetails(
  selectedOptions: SelectedOption[] | undefined,
  fallbackTitle: string,
) {
  const options = (selectedOptions || []).filter(
    (option) => option.name !== "Title" && option.value.trim(),
  );
  if (options.length) {
    return options.map((option) => ({
      key: option.name,
      value: formatCartAttributeValue(option.name, option.value),
    }));
  }

  const values = fallbackTitle
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return values.map((value, index) => ({
    key: index === 0 ? "Variant" : `Option ${index + 1}`,
    value: formatCentimetres(value),
  }));
}
