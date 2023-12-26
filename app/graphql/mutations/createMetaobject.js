export const CREATE_METAOBJECT_MUTATION = `
  #graphql
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            handle
            id
            capabilities {
              publishable {
                status
              }
            }
            slug: field(key: "slug") {
              value
            }
            title: field(key: "title") {
              value
            }
            description: field(key: "bio") {
              value
            }
            status: field(key: "status") {
              value
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

export const UPDATE_METAOBJECT = `
#graphql
        mutation UpdateMetaobject($metaobject: MetaobjectUpdateInput!, $id: ID!) {
          metaobjectUpdate(id: $id, metaobject: $metaobject, ) {
            metaobject {
              handle
              id
              slug: field(key: "slug") {
                value
              }
              title: field(key: "title") {
                value
              }
              description: field(key: "bio") {
                value
              }
              social: field(key: "social") {
                value
              }
              enabled: field(key: "enabled") {
                value
              }
              image: field(key: "image") {
                reference {
                  ... on MediaImage {
                    image {
                      originalSrc
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      `;
