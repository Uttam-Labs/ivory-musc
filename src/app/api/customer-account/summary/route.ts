import { NextResponse } from "next/server";
import { storefrontCustomerFetch } from "@/lib/customer-account/client";
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
    const data = await storefrontCustomerFetch<{
      customer?: { firstName?: string; displayName?: string };
    }>(
      `query HeaderCustomer($customerAccessToken:String!){customer(customerAccessToken:$customerAccessToken){firstName displayName}}`,
      { customerAccessToken: session.accessToken },
    ).catch(() => null);
    firstName =
      data?.customer?.firstName || data?.customer?.displayName?.split(/\s+/)[0];
  }
  return NextResponse.json(
    { authenticated: true, firstName },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
