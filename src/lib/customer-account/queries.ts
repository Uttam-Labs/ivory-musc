export const ADDRESS_FIELDS = `id firstName lastName company address1 address2 city province provinceCode country countryCodeV2 zip phone formatted`;

export const ACCOUNT_QUERY = `query AccountOverview($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id displayName firstName lastName
    email
    defaultAddress { ${ADDRESS_FIELDS} }
    addresses(first: 20) { nodes { ${ADDRESS_FIELDS} } }
    orders(first: 5, reverse: true) { nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } }
  }
}`;

export const ORDERS_QUERY = `query CustomerOrders($first: Int!, $customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) { orders(first: $first, reverse: true, sortKey: PROCESSED_AT) { nodes { id name processedAt canceledAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } } }
}`;

export const ORDER_QUERY = `query CustomerOrder($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) { orders(first: 100, reverse: true) { nodes {
    id name orderNumber processedAt canceledAt cancelReason email phone financialStatus fulfillmentStatus statusUrl
    totalPrice { amount currencyCode }
    subtotalPrice { amount currencyCode }
    totalShippingPrice { amount currencyCode }
    totalTax { amount currencyCode }
    totalRefunded { amount currencyCode }
    shippingAddress { ${ADDRESS_FIELDS} }
    billingAddress { ${ADDRESS_FIELDS} }
    successfulFulfillments {
      trackingCompany
      trackingInfo(first: 10) { number url }
    }
    lineItems(first: 100) { nodes {
      title quantity currentQuantity
      originalTotalPrice { amount currencyCode }
      discountedTotalPrice { amount currencyCode }
      customAttributes { key value }
      variant {
        id title sku
        image { url altText }
        price { amount currencyCode }
        product { handle title }
      }
    } }
  } } }
}`;

export const ADDRESSES_QUERY = `query CustomerAddresses($customerAccessToken: String!) { customer(customerAccessToken: $customerAccessToken) { defaultAddress { id } addresses(first: 50) { nodes { ${ADDRESS_FIELDS} } } } }`;

export const PROFILE_QUERY = `query CustomerProfile($customerAccessToken: String!) { customer(customerAccessToken: $customerAccessToken) { id firstName lastName displayName email phone acceptsMarketing defaultAddress { countryCodeV2 } } }`;
