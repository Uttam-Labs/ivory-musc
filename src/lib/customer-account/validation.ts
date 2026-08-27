export type CustomerMutationError = {
  code?: string | null;
  message: string;
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginInput(email: string, password: string) {
  const errors: Record<string, string> = {};
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(email))
    errors.email = "Please enter a valid email address.";
  if (!password) errors.password = "Please enter your password.";
  return errors;
}

export function validateRegistrationInput(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const errors: Record<string, string> = {};
  if (!input.firstName) errors.firstName = "Please enter your first name.";
  if (!input.lastName) errors.lastName = "Please enter your last name.";
  if (!input.email) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(input.email))
    errors.email = "Please enter a valid email address.";
  if (!input.password) errors.password = "Please create a password.";
  else if (
    ![
      input.password.length >= 8,
      /[a-z]/.test(input.password) && /[A-Z]/.test(input.password),
      /\d/.test(input.password),
      /[^A-Za-z0-9]/.test(input.password),
    ].every(Boolean)
  )
    errors.password = "Please meet all password requirements.";
  if (!input.confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (input.password !== input.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function isPrivateRecoveryResult(error?: CustomerMutationError) {
  if (!error) return true;
  return (
    ["CUSTOMER_DISABLED", "NOT_FOUND", "UNIDENTIFIED_CUSTOMER"].includes(
      error.code || "",
    ) || /could not find customer|unidentified customer/i.test(error.message)
  );
}

export function shouldSendAccountInvite(state?: string) {
  return state === "DISABLED" || state === "DECLINED" || state === "INVITED";
}
