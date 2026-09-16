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
  attributes: Array<{ key: string; value: string }> = [],
) {
  const options = (selectedOptions || []).filter(
    (option) => option.name !== "Title" && option.value.trim(),
  );
  const normalizeKey = (key: string) =>
    /^(?:selected\s+)?colou?r$/i.test(key.trim()) ? "Colour" : key.trim();
  const details = new Map<string, string>();

  options.forEach((option) => {
    const key = normalizeKey(option.name);
    details.set(key, formatCartAttributeValue(key, option.value));
  });
  attributes
    .filter((attribute) => attribute.value.trim() && !attribute.key.startsWith("_") && !/^(?:type|main product|sample size)$/i.test(attribute.key))
    .forEach((attribute) => {
      const key = normalizeKey(attribute.key);
      details.set(key, formatCartAttributeValue(key, attribute.value));
    });

  if (details.size) {
    const preferredOrder = ["Colour", "Width", "Composition"];
    return [...details.entries()]
      .sort(([left], [right]) => {
        const leftIndex = preferredOrder.indexOf(left);
        const rightIndex = preferredOrder.indexOf(right);
        return (leftIndex < 0 ? preferredOrder.length : leftIndex) - (rightIndex < 0 ? preferredOrder.length : rightIndex);
      })
      .map(([key, value]) => ({ key, value }));
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
