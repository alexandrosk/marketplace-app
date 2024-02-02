export const PUBLISH_MUTATION = `#graphql
mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable {
      availablePublicationCount
    }
    shop {
      id
    }
    userErrors {
      field
      message
    }
  }
}`;
