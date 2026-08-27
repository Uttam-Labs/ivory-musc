import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const CUSTOMER_SESSION_COOKIE = "ivory_customer_session";

export type CustomerSession = {
  accessToken: string;
  idToken?: string;
  firstName?: string;
  remember?: boolean;
  expiresAt: number;
};

function key() {
  if (!env.CUSTOMER_ACCOUNT_SESSION_SECRET)
    throw new Error("Customer account session secret is not configured");
  return createHash("sha256")
    .update(env.CUSTOMER_ACCOUNT_SESSION_SECRET)
    .digest();
}

export function encryptSession(value: CustomerSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptSession(value: string): CustomerSession | null {
  try {
    const [iv, tag, encrypted] = value
      .split(".")
      .map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const session = JSON.parse(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
        "utf8",
      ),
    ) as CustomerSession;
    return session.expiresAt > Date.now() + 30_000 ? session : null;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const value = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  return value ? decryptSession(value) : null;
}

export const customerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
