export const GET_METAOBJECT = `#graphql
query getMetaObject($id: ID!) {
  metaobject(id: $id) {
    id
    type
    slug: field(key: "slug") {
      value
    }
    capabilities {
      publishable {
        status
      }
    }
    payment_details: field(key: "payment_details") {
      value
    }
    commission: field(key: "commission") {
      value
    }
    title: field(key: "title") {
      value
    }
    bio: field(key: "description") {
      value
    }
    enabled: field(key: "enabled") {
      value
    }
    url: field(key: "social") {
      value
    }
    status: field(key: "status") {
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
}`;

export const getOrdersFromVendors = `#graphql
query getMetaObject($id: ID!) {
  metaobject(id: $id) {
    id
    type
    referencedBy(first: 10) {
      nodes {
        referencer {
          ... on Order {
            id
            email
            shippingAddress{
              firstName
            }
            billingAddress {
              firstName
            }
            billingAddressMatchesShippingAddress
            metafields(first:10, namespace: "vendor") {
              nodes{
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
