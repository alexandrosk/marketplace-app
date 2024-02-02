export const CREATE_COLLECTION = `#graphql
mutation collectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
      title
      handle
      templateSuffix
      ruleSet {
        appliedDisjunctively
        rules {
          column
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

export const SET_COLLECTION_METAFIELDS = `#graphql
mutation collectionSetMetafields($input: CollectionInput!) {
  collectionSetMetafields(input: $input) {
    collection {
      id
      metafields(first: 5) {
        edges {
          node {
            id
            key
            namespace
            value
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;
