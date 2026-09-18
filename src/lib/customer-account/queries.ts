export const ADDRESS_FIELDS = `id firstName lastName company address1 address2 city province zoneCode country territoryCode zip phone: phoneNumber formatted(withName: true)`;

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
  customer { orders(first: $first, reverse: true, sortKey: PROCESSED_AT) { nodes { id name processedAt cancelledAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } } }
}`;

export const ORDERS_FALLBACK_QUERY = `query CustomerOrdersFallback($first: Int!) {
  customer { orders(first: $first, reverse: true) { nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } } } }
}`;

export const ORDER_QUERY = `query CustomerOrder {
  customer { orders(first: 100, reverse: true) { nodes {
    id name orderNumber: number processedAt canceledAt: cancelledAt cancelReason currencyCode email phone financialStatus fulfillmentStatus statusUrl: statusPageUrl
    totalPrice { amount currencyCode }
    subtotalPrice: subtotal { amount currencyCode }
    totalShippingPrice: totalShipping { amount currencyCode }
    totalTax { amount currencyCode }
    totalRefunded { amount currencyCode }
    shippingAddress { ${ADDRESS_FIELDS} }
    billingAddress { ${ADDRESS_FIELDS} }
    fulfillments(first: 20) { nodes { latestShipmentStatus trackingInformation { number url } } }
    lineItems(first: 100) { nodes {
      title: name quantity currentQuantity: refundableQuantity
      originalTotalPrice: currentTotalPrice { amount currencyCode }
      discountedTotalPrice: currentTotalPrice { amount currencyCode }
      customAttributes { key value }
      id image { url altText } sku price { amount currencyCode } productId
    } }
  } } }
}`;

export const ADDRESSES_QUERY = `query CustomerAddresses { customer { defaultAddress { id } addresses(first: 50) { nodes { ${ADDRESS_FIELDS} } } } }`;

export const PROFILE_QUERY = `query CustomerProfile { customer { id firstName lastName displayName emailAddress { emailAddress marketingState } phoneNumber { phoneNumber } defaultAddress { countryCodeV2: territoryCode } } }`;
