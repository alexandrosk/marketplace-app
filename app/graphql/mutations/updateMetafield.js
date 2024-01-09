export const UPDATE_METAFIELD = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;
