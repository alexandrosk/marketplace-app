export const CREATE_METAOBJECT_VENDOR = `
  #graphql
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          access {
            storefront
          }
          capabilities {
            publishable {
              enabled
            }
#            renderable {
#              enabled
#              data {
#                metaTitleKey
#                metaDescriptionKey
#              }
#            }
          }
          name
          type
          fieldDefinitions {
            name
            key
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }`;
