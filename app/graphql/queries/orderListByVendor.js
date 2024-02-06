export const ORDER_LIST_BY_VENDOR_QUERY = `
  #graphql
  query getMetaObject($id: ID!) {
    metaobject(id: $id) {
      __typename
      displayName
      id
      type
      referencedBy(first: 20) {
        nodes {
          referencer {
            ... on Order {
              id

              unpaid
              name
              lineItems(first:30) {
                nodes {
                  id
                  name
                  unfulfilledQuantity
                  product{
                    metafield: metafield(namespace: "vendor", key: "vendor_id") {
                      id
                      namespace
                      key
                      value
                    }
                  }
                }
              }
              fulfillmentOrders(first: 10) {
                nodes {
                  id
                  lineItems(first: 30) {
                    nodes {
                      id
                      productTitle
                      remainingQuantity
                    }
                  }
                }
              }
              createdAt
              totalWeight
              totalReceived
              displayFulfillmentStatus
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              billingAddress {
                firstName
              }
              billingAddressMatchesShippingAddress
              metafields(first: 10, namespace: "vendor") {
                nodes {
                  id
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }`;
