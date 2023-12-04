export const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
        product {
          id
          title
          descriptionHtml
          status
          collectionsToJoin: collections(first: 5) {
            edges {
              node {
                id
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price
              }
            }
          }
        }
      userErrors {
        message
        field
      }
    }
  }`;
