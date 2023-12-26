export const PRODUCT_LIST_BY_METAFIELD_QUERY = `
  query AllProducts ($vendorSlug: String!) {
  collection(handle: $vendorSlug) {
    handle
    products(first: 10) {
      edges {
        node {
          handle
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
        }
      }
    }
  }
}`;
