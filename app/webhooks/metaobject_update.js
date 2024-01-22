//METAOBJECTS_CREATE && METAOBJECTS_UPDATE && METAOBJECTS_DELETE
//should send email to admin if vendor is created, also to vendor if vendor is approved
//if vendor deactivates shop, also deactivate collection & products
//if vendor is approved, create related collection
//https://shopify.dev/docs/api/admin-graphql/2024-01/enums/WebhookSubscriptionTopic

import { CREATE_COLLECTION } from "~/graphql/mutations/createCollection";
import { UPDATE_METAOBJECT } from "~/graphql/mutations/createMetaobject";

/**
 *
 * @param admin
 * @param shop
 * @param session
 * @param vendor
 * @returns {Promise<boolean|*>}
 */
const createCollection = async (admin, shop, session, vendor) => {
  const generalInfo = JSON.parse(vendor.fields.general);
  try {
    const response = await admin.graphql(CREATE_COLLECTION, {
      variables: {
        input: {
          handle: vendor.handle,
          templateSuffix: "vendor",
          title: "Shop - " + vendor.fields.title,
          metafields: [
            {
              key: "vendors",
              //@todo replace this with vendor.vendor_id
              namespace: "custom",
              value: vendor.id,
            },
          ],
          ruleSet: {
            appliedDisjunctively: true,
            rules: {
              column: "PRODUCT_METAFIELD_DEFINITION",
              relation: "EQUALS",
              condition: generalInfo.customerId,
              conditionObjectId:
                "gid://shopify/MetafieldDefinition/16362274967",
            },
          },
        },
      },
    });

    const responseJson = await response.json();

    if (responseJson.userErrors) {
      console.error("Error in createCollection:", JSON.stringify(responseJson));
      return;
    }
    return responseJson.data.collectionCreate.collection;
  } catch (error) {
    console.error("Error in updateOrderMetafields:", error);
    return false;
  }
};

export const metaobject_update = async (
  admin,
  topic,
  shop,
  session,
  payload,
) => {
  console.log("metaobject_update", topic, shop, payload, session);
  try {
    const generalInfo = JSON.parse(payload.fields.general);
    if (
      payload.fields.status === '["Approved"]' &&
      generalInfo.previous_status === "pending" &&
      !payload.product_list
    ) {
      const collection = await createCollection(admin, shop, session, payload);
      if (collection) {
        const response = await admin.graphql(UPDATE_METAOBJECT, {
          variables: {
            metaobject: {
              fields: [
                {
                  key: "product_list",
                  value: collection.id,
                },
                {
                  key: "general",
                  value: JSON.stringify(
                    Object.assign(generalInfo, {
                      previous_status: "approved",
                    }),
                  ),
                },
              ],
            },
            id: payload.id,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error in metaobject_update:", JSON.stringify(error));
  }
  return new Response("metaobject_update", { status: 200 });
};
export const metaobject_create = async (topic, shop, session, payload) => {
  if (payload) {
    console.log("metaobject_create", topic, shop, payload, session);
  }
  return new Response("metaobject_create", { status: 200 });
};
