import assert from "node:assert/strict";
import test from "node:test";
import { displayFabricWeight } from "../src/lib/shopify/product-display.ts";
import type { Product, ProductVariant } from "../src/lib/shopify/types.ts";

function product(handle: string, weight: string) {
  return { handle, fabricWeight: { value: weight } } as Product;
}

function variant(value: string) {
  return { selectedOptions: [{ name: "Colour", value }] } as ProductVariant;
}

test("Satin Organza weight follows the selected colour variant momme", () => {
  const satinOrganza = product("satin-organza", "174gsm ( 40mm) ");
  assert.equal(displayFabricWeight(satinOrganza, variant("Silk White 12mm")), "174gsm (12mm)");
  assert.equal(displayFabricWeight(satinOrganza, variant("Ivory 16mm")), "174gsm (16mm)");
});

test("other products keep their original weight", () => {
  const otherProduct = product("haute-organza", "174gsm (40mm)");
  assert.equal(displayFabricWeight(otherProduct, variant("Ivory 16mm")), "174gsm (40mm)");
});
