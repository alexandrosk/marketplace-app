export const CREATE_COLLECTION = `#graphql
mutation collectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      title
      handle
      templateSuffix
      ruleSet {
        appliedDisjunctively
        rules {
          column
        }
      }
      publishedOnCurrentPublication
    }
    userErrors {
      field
      message
    }
  }
}
`;
