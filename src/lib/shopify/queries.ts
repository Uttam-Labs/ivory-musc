export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id handle title description
    featuredDescription: metafield(namespace: "custom", key: "featured_description") { value type }
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    options {
      id name
      optionValues {
        id name
        swatch { color image { previewImage { url } } }
      }
    }
    variants(first: 30) {
      nodes { id selectedOptions { name value } }
    }
  }
`;

export const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) { nodes { ...ProductCard } }
  }
`;

export const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id handle title description
      featuredTitle: metafield(namespace: "custom", key: "featured_title") { value }
      composition: metafield(namespace: "custom", key: "composition") { value }
      fabricWeight: metafield(namespace: "custom", key: "weight") { value }
      fabricWidth: metafield(namespace: "custom", key: "width") { value }
      care: metafield(namespace: "custom", key: "care") { value }
      featuredImage { url altText width height }
      images(first: 20) { nodes { url altText width height } }
      priceRange { minVariantPrice { amount currencyCode } }
      options {
        id name
        optionValues {
          id name
          swatch { color image { previewImage { url } } }
        }
      }
      variants(first: 250) {
        nodes {
          id title availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url altText width height }
          selectedOptions { name value }
        }
      }
    }
  }
`;

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) { ...ProductCard }
  }
`;

export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first, sortKey: TITLE) { nodes { id handle title description image { url altText width height } } }
  }
`;

export const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id handle title description image { url altText width height }
      products(first: $first) { nodes { ...ProductCard } }
    }
  }
`;

export const CART_FRAGMENT = `#graphql
  fragment CartDetails on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) { nodes { id quantity cost { amountPerQuantity { amount currencyCode } totalAmount { amount currencyCode } } merchandise { ... on ProductVariant { id title price { amount currencyCode } compareAtPrice { amount currencyCode } image { url altText width height } product { handle title } } } } }
  }
`;

export const CART_QUERY = `#graphql
  ${CART_FRAGMENT}
  query Cart($id: ID!) { cart(id: $id) { ...CartDetails } }
`;

export const CART_CREATE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ...CartDetails } userErrors { field message } } }
`;
export const CART_LINES_ADD_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartDetails } userErrors { field message } } }
`;
export const CART_LINES_UPDATE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartDetails }
      userErrors { field message }
    }
  }
`;
export const CART_LINES_REMOVE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartDetails }
      userErrors { field message }
    }
  }
`;
