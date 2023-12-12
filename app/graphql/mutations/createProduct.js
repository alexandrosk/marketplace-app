export const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($media: [CreateMediaInput!]!, $input: ProductInput!) {
    productCreate(media: $media, input: $input) {
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

export const STAGES_UPLOAD_CREATE = `
 mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        resourceUrl
        url
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;
