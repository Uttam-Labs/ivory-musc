import assert from "node:assert/strict";
import test from "node:test";
import {
  customerSessionPersistence,
  isRememberMeEnabled,
  REMEMBERED_SESSION_SECONDS,
} from "../src/lib/customer-account/session-policy.ts";

test("remember me accepts the checkbox values sent by browsers", () => {
  assert.equal(isRememberMeEnabled("on"), true);
  assert.equal(isRememberMeEnabled("true"), true);
  assert.equal(isRememberMeEnabled("1"), true);
  assert.equal(isRememberMeEnabled(null), false);
  assert.equal(isRememberMeEnabled("false"), false);
});

test("unchecked login creates a browser-session cookie", () => {
  assert.deepEqual(customerSessionPersistence(false, Date.now() + 60_000), {});
});

test("remembered login persists for 30 days without exceeding the Shopify token", () => {
  const now = Date.UTC(2026, 8, 18);
  const longTokenExpiry = now + REMEMBERED_SESSION_SECONDS * 2000;
  const remembered = customerSessionPersistence(true, longTokenExpiry, now);

  assert.equal(remembered.maxAge, REMEMBERED_SESSION_SECONDS);
  assert.equal(
    remembered.expires?.getTime(),
    now + REMEMBERED_SESSION_SECONDS * 1000,
  );

  const shortTokenExpiry = now + 60_000;
  const capped = customerSessionPersistence(true, shortTokenExpiry, now);
  assert.equal(capped.maxAge, 60);
  assert.equal(capped.expires?.getTime(), shortTokenExpiry);
});
