import { json } from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import { authenticate, unauthenticated } from "~/shopify.server";

export let action = async ({ request }) => {
  try {
    verifySignature(request.url);
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const customerId = searchParams.get("logged_in_customer_id");

    const awaitRequest = await request.text();
    let formData = JSON.parse(awaitRequest);

    const { admin } = await unauthenticated.admin(shop ?? "");

    let handle = formData.username;
    if (formData.vendorId) {
      const response = await admin.graphql(
        `#graphql
                mutation UpdateMetaobject($metaobject: MetaobjectUpdateInput!, $id: ID!) {
                    metaobjectUpdate(id: $id, metaobject: $metaobject) {
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
                }`,
        {
          variables: {
            metaobject: {
              fields: [
                formData.username && {
                  key: "slug",
                  value: formData.username,
                },
                formData.title && {
                  key: "title",
                  value: formData.title,
                },
                formData.bio && {
                  key: "description",
                  value: formData.bio,
                },
                formData.urls && {
                  key: "social",
                  value: JSON.stringify(formData.urls),
                },
                {
                  key: "enabled",
                  value: formData.enabled
                    ? formData.enabled.toString()
                    : "false",
                },
              ],
            },
            id: formData.vendorId,
          },
        },
      );

      const responseJson = await response.json();
      return json({ error: "Vendor updated" }, { status: 200 });
    }
    const response = await admin.graphql(
      `#graphql
            mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
              metaobjectCreate(metaobject: $metaobject) {
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
                }
                userErrors {
                  field
                  message
                  code
                }
              }
            }`,
      {
        variables: {
          metaobject: {
            type: "vendors",
            handle: formData.username,
            fields: [
              {
                key: "slug",
                value: formData.username,
              },
              {
                key: "title",
                value: formData.title,
              },
              {
                key: "description",
                value: formData.bio,
              },
            ],
          },
        },
      },
    );
    //data from graphql
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson.data));

    if (responseJson.data.metaobjectCreate.userErrors.length > 0) {
      return json(
        { error: responseJson.data.metaobjectCreate.userErrors[0].message },
        { status: 400 },
      );
    }

    const response2 = await admin.graphql(
      `#graphql
              mutation updateCustomerMetafields($input: CustomerInput!) {
                  customerUpdate(input: $input) {
                    customer {
                      id
                      metafields(first: 3) {
                        edges {
                          node {
                            id
                            namespace
                            key
                            value
                          }
                        }
                      }
                    }
                    userErrors {
                      message
                      field
                    }
                  }
              }`,
      {
        variables: {
          input: {
            metafields: [
              {
                namespace: "custom",
                key: "vendor_id",
                value: responseJson.data.metaobjectCreate.metaobject.id,
              },
            ],
            id: "gid://shopify/Customer/" + customerId,
          },
        },
      },
    );

    const responseJson2 = await response2.json();
    console.log(JSON.stringify(responseJson2.data));

    return json(responseJson2, { status: 200 });
  } catch (error) {
    console.log(error);
    return json({ error: error }, { status: 400 });
  }
};

export let loader = async ({ request }) => {
  try {
    verifySignature(request.url, true);
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return json({ error: "Invalid customer id" }, { status: 200 });
    }
    const shop = searchParams.get("shop");
    const { admin } = await unauthenticated.admin(shop ?? "");
    const response = await admin.graphql(
      `#graphql
            query getMetaObject($id: ID!) {
              metaobject(id: $id) {
                id
                type
                handle
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
            }`,
      {
        variables: {
          id: customerId,
        },
      },
    );
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson.data));
    return json(responseJson.data, { status: 200 });
  } catch (error) {
    return json({ error: JSON.stringify(error) }, { status: 400 });
  }
};
