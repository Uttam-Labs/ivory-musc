import assert from "node:assert/strict";
import test from "node:test";
import {
  isPrivateRecoveryResult,
  shouldSendAccountInvite,
  validateLoginInput,
  validateRegistrationInput,
} from "../src/lib/customer-account/validation.ts";

test("login validation reports only the fields that need attention", () => {
  assert.deepEqual(validateLoginInput("customer@example.com", "secret"), {});
  assert.deepEqual(validateLoginInput("invalid", "secret"), {
    email: "Please enter a valid email address.",
  });
  assert.deepEqual(validateLoginInput("customer@example.com", ""), {
    password: "Please enter your password.",
  });
});

test("registration requires a strong matching password", () => {
  const valid = {
    firstName: "Ivory",
    lastName: "Muse",
    email: "customer@example.com",
    password: "Silk#2026",
    confirmPassword: "Silk#2026",
  };
  assert.deepEqual(validateRegistrationInput(valid), {});
  assert.equal(
    validateRegistrationInput({ ...valid, password: "weak", confirmPassword: "different" })
      .password,
    "Please meet all password requirements.",
  );
  assert.equal(
    validateRegistrationInput({ ...valid, confirmPassword: "Silk#2027" })
      .confirmPassword,
    "Passwords do not match.",
  );
});

test("password recovery does not expose whether an account exists", () => {
  assert.equal(isPrivateRecoveryResult(), true);
  assert.equal(
    isPrivateRecoveryResult({ code: "UNIDENTIFIED_CUSTOMER", message: "Unidentified customer" }),
    true,
  );
  assert.equal(
    isPrivateRecoveryResult({ code: null, message: "Could not find customer" }),
    true,
  );
  assert.equal(
    isPrivateRecoveryResult({ code: "INVALID", message: "Invalid request" }),
    false,
  );
});

test("only inactive legacy accounts receive an activation invitation", () => {
  assert.equal(shouldSendAccountInvite("DISABLED"), true);
  assert.equal(shouldSendAccountInvite("INVITED"), true);
  assert.equal(shouldSendAccountInvite("DECLINED"), true);
  assert.equal(shouldSendAccountInvite("ENABLED"), false);
  assert.equal(shouldSendAccountInvite(undefined), false);
});
