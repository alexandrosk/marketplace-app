import {json} from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import {authenticate, unauthenticated} from "~/shopify.server";

export let action = async ({ request }) => {
    try {
        verifySignature(request.url);
        const { searchParams } = new URL(request.url);
        const shop = searchParams.get("shop");
        const customerId = searchParams.get("logged_in_customer_id");

        const awaitRequest = await request.text();
        let formData = JSON.parse(awaitRequest);

        const {admin} = await unauthenticated.admin(shop??'');

        let handle = formData.username;

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
                  "metaobject": {
                    "type": "vendors",
                    "handle": formData.username,
                    "fields": [
                      {
                        "key": "slug",
                        "value": formData.username
                      },
                        {
                            "key": "title",
                            "value": formData.title
                        }
                    ]
                  }
                }
            }
        );
        //data from graphql
        const responseJson = await response.json();
        console.log(JSON.stringify(responseJson.data));

        if (responseJson.data.metaobjectCreate.userErrors.length > 0) {
            return json({ error: responseJson.data.metaobjectCreate.userErrors[0].message }, { status: 400 });
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
                    "input": {
                        "metafields": [
                            {
                                "namespace": "custom",
                                "key": "vendor_id",
                                "value": responseJson.data.metaobjectCreate.metaobject.id,
                            },
                        ],
                        "id": "gid://shopify/Customer/"+customerId,
                    }
                }
            });

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
            return json({ error: 'Invalid customer id' }, { status: 200 });
        }
        const shop = searchParams.get("shop");
        const {admin} = await unauthenticated.admin(shop??"");
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
              }
            }`,
            {
                variables: {
                    id: customerId,
                }
            });
        const responseJson = await response.json();
        console.log(JSON.stringify(responseJson.data));
        return json(responseJson.data, { status: 200 });
    } catch (error) {
        return json({ error: JSON.stringify(error) }, { status: 400 });
    }
}
