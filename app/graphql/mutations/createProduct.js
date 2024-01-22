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
          options {
            name
            values
            id
            position
          }
          variants(first: 5) {
            nodes {
              id
              title
              selectedOptions {
                name
                value
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
