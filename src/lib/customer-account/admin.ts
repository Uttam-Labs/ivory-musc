import "server-only";

import { env } from "@/lib/env";
import { shouldSendAccountInvite } from "./validation";

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function adminFetch<T>(query: string, variables: Record<string, unknown>) {
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN)
    throw new Error("Shopify Admin customer access is not configured.");
  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );
  const result = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok || result.errors?.length || !result.data)
    throw new Error(
      result.errors?.map(({ message }) => message).join("; ") ||
        `Shopify Admin API failed (${response.status}).`,
    );
  return result.data;
}

export type OrderPaymentSummary = {
  gateway: string;
  method: string;
  maskedNumber?: string;
  amount?: { amount: string; currencyCode: string };
  status: string;
};

export async function getOrderPaymentSummary(orderId: string): Promise<OrderPaymentSummary | null> {
  const data = await adminFetch<{
    order: {
      transactions: Array<{
        accountNumber?: string | null;
        formattedGateway?: string | null;
        gateway?: string | null;
        kind: string;
        status: string;
        amountSet?: { presentmentMoney?: { amount: string; currencyCode: string } | null } | null;
        paymentDetails?:
          | { paymentMethodName?: string | null; company?: string | null; number?: string | null }
          | null;
      }>;
    } | null;
  }>(
    `query OrderPaymentSummary($orderId:ID!){order(id:$orderId){transactions(first:20){accountNumber formattedGateway gateway kind status amountSet{presentmentMoney{amount currencyCode}} paymentDetails{... on CardPaymentDetails{paymentMethodName company number} ... on LocalPaymentMethodsPaymentDetails{paymentMethodName} ... on PaypalWalletPaymentDetails{paymentMethodName} ... on ShopPayInstallmentsPaymentDetails{paymentMethodName}}}}}`,
    { orderId },
  );
  const transactions = data.order?.transactions || [];
  const transaction =
    transactions.find((item) => item.status === "SUCCESS" && ["SALE", "CAPTURE"].includes(item.kind)) ||
    transactions.find((item) => item.status === "SUCCESS" && item.kind === "AUTHORIZATION") ||
    transactions.find((item) => !["REFUND", "VOID"].includes(item.kind));
  if (!transaction) return null;

  const details = transaction.paymentDetails;
  return {
    gateway: transaction.formattedGateway || transaction.gateway || "Shopify secure payment",
    method: details?.paymentMethodName || details?.company || "Payment method",
    maskedNumber: details?.number || transaction.accountNumber || undefined,
    amount: transaction.amountSet?.presentmentMoney || undefined,
    status: transaction.status,
  };
}

export async function sendAccountInviteIfInactive(email: string) {
  const customerData = await adminFetch<{
    customers: { nodes: Array<{ id: string; state: string }> };
  }>(
    `query RecoveryCustomer($query:String!){customers(first:1,query:$query){nodes{id state}}}`,
    { query: `email:${JSON.stringify(email.trim().toLowerCase())}` },
  );
  const customer = customerData.customers.nodes[0];
  if (!customer || !shouldSendAccountInvite(customer.state)) return false;

  const inviteData = await adminFetch<{
    customerSendAccountInviteEmail: {
      customer?: { id: string } | null;
      userErrors: Array<{ message: string }>;
    };
  }>(
    `mutation RecoveryInvite($customerId:ID!){customerSendAccountInviteEmail(customerId:$customerId){customer{id}userErrors{message}}}`,
    { customerId: customer.id },
  );
  const result = inviteData.customerSendAccountInviteEmail;
  if (result.userErrors.length)
    throw new Error(result.userErrors.map(({ message }) => message).join("; "));
  return Boolean(result.customer);
}
