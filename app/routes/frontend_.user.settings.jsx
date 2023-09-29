import {json} from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import {unauthenticated} from "~/shopify.server";

export let action = async ({ request }) => {
  try {
    verifySignature(request.url);
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const customerId = searchParams.get("logged_in_customer_id");
    console.log(customerId);
    const awaitRequest = await request.text();
    let formData = JSON.parse(awaitRequest);

    const {admin} = await unauthenticated.admin(shop??'');

    let handle = formData.username;
    handle = handle.replace(/\s+/g, '-').toLowerCase();
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
              }
            ]
          }
        }
      }
    );
    //data from graphql
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson.data));

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

    let responseData = await request.text();
    return json(JSON.parse(responseData), { status: 200 });
  } catch (error) {
    console.log(error);
    return json({ error: error }, { status: 400 });
  }
};
