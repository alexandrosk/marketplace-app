export const PRODUCT_LIST_BY_METAFIELD_QUERY = `
  query ProductsByMetafield($customerId: String!) {
    products(first: 10, query: "metafield:'vendor.customer_id:$customerId'") {
      edges {
        node {
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }`;
