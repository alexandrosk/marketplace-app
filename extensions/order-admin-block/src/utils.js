export async function updateIssues(id, newIssues) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `mutation SetMetafield($namespace: String!, $ownerId: ID!, $key: String!, $type: String!, $value: String!) {
    metafieldDefinitionCreate(
      definition: {namespace: $namespace, key: $key, name: "Tracked Issues", ownerType: PRODUCT, type: $type, access: {admin: MERCHANT_READ_WRITE}}
    ) {
      createdDefinition {
        id
      }
    }
    metafieldsSet(metafields: [{ownerId:$ownerId, namespace:$namespace, key:$key, type:$type, value:$value}]) {
      userErrors {
        field
        message
        code
      }
    }
  }
  `,
    {
      ownerId: id,
      namespace: "$app:issues",
      key: "issues",
      type: "json",
      value: JSON.stringify(newIssues),
    },
  );
}
export async function getIssues(productId) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `query Product($id: ID!) {
      product(id: $id) {
        metafield(namespace: "$app:issues", key:"issues") {
          value
        }
      }
    }
  `,
    { id: productId },
  );
}
async function makeGraphQLQuery(query, variables) {
  const graphQLQuery = {
    query,
    variables,
  };

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });

  if (!res.ok) {
    console.error("Network error");
  }

  return await res.json();
}
