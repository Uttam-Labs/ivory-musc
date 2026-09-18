import { NextResponse } from "next/server";
import { customerAccountFetch } from "@/lib/customer-account/client";
import { getCustomerSession } from "@/lib/customer-account/session";

export async function GET() {
  const session = await getCustomerSession();
  if (!session)
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  let firstName = session.firstName;
  if (!firstName) {
    const data = await customerAccountFetch<{
      customer?: { firstName?: string; displayName?: string };
    }>(`query HeaderCustomer { customer { firstName displayName } }`).catch(() => null);
    firstName =
      data?.customer?.firstName || data?.customer?.displayName?.split(/\s+/)[0];
  }
  return NextResponse.json(
    { authenticated: true, firstName },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
