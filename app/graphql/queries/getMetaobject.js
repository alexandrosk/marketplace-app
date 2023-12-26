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
