export const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 30;

export function isRememberMeEnabled(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

export function customerSessionPersistence(
  remember: boolean,
  tokenExpiresAt: number,
  now = Date.now(),
) {
  if (!remember) return {};

  const rememberedExpiry = Math.min(
    tokenExpiresAt,
    now + REMEMBERED_SESSION_SECONDS * 1000,
  );
  const maxAge = Math.max(0, Math.floor((rememberedExpiry - now) / 1000));

  return {
    expires: new Date(rememberedExpiry),
    maxAge,
  };
}
