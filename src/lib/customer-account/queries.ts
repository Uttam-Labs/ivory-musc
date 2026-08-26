export const ADDRESS_FIELDS = `id firstName lastName company address1 address2 city province zoneCode country territoryCode zip phoneNumber formatted(withName: true, withCompany: true)`;

export const ACCOUNT_QUERY = `query AccountOverview {
  customer {
    id displayName firstName lastName
    emailAddress { emailAddress }
    defaultAddress { ${ADDRESS_FIELDS} }
    addresses(first: 20) { nodes { ${ADDRESS_FIELDS} } }
    orders(first: 5, reverse: true) { nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } }
  }
}`;

export const ORDERS_QUERY = `query CustomerOrders($first: Int!) {
  customer { orders(first: $first, reverse: true) { nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } } }
}`;

export const ORDER_QUERY = `query CustomerOrder($query: String!) {
  customer { orders(first: 1, query: $query) { nodes {
    id name processedAt financialStatus fulfillmentStatus statusPageUrl
    totalPrice { amount currencyCode }
    subtotal { amount currencyCode }
    totalShipping { amount currencyCode }
    totalTax { amount currencyCode }
    shippingAddress { ${ADDRESS_FIELDS} }
    billingAddress { ${ADDRESS_FIELDS} }
    lineItems(first: 100) { nodes { id title quantity image { url altText } price { amount currencyCode } totalPrice { amount currencyCode } } }
  } } }
}`;

export const ADDRESSES_QUERY = `query CustomerAddresses { customer { defaultAddress { id } addresses(first: 50) { nodes { ${ADDRESS_FIELDS} } } } }`;
