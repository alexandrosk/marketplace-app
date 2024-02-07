//METAOBJECTS_CREATE && METAOBJECTS_UPDATE && METAOBJECTS_DELETE
//should send email to admin if vendor is created, also to vendor if vendor is approved
//if vendor deactivates shop, also deactivate collection & products
//if vendor is approved, create related collection
//https://shopify.dev/docs/api/admin-graphql/2024-01/enums/WebhookSubscriptionTopic

import { CREATE_COLLECTION } from "~/graphql/mutations/createCollection";
import { UPDATE_METAOBJECT } from "~/graphql/mutations/createMetaobject";
import { getSetting } from "~/models/settings.server";
import { PUBLISH_MUTATION } from "~/graphql/mutations/publishablePublish";

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
    //get metafield ID
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const metafieldID = await admin.graphql(`
    #graphql
    query {
      metafieldDefinitions (key:"customer_id",namespace:"vendor", ownerType:PRODUCT, first: 10) {
        nodes {
          id
        }
      }
    }`);

    const metafieldIDJson = await metafieldID.json();
    console.log("metafieldIDJson", JSON.stringify(metafieldIDJson));
    //sleep
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await admin.graphql(CREATE_COLLECTION, {
      variables: {
        input: {
          handle: vendor.handle,
          templateSuffix: "vendor",
          title: "Shop - " + vendor.fields.title,
          metafields: [
            {
              key: "vendor_id",
              //@todo replace this with vendor.vendor_id
              namespace: "vendor",
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
                metafieldIDJson?.data?.metafieldDefinitions?.nodes[0]?.id,
            },
          },
        },
      },
    });

    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson));
    if (responseJson.data.collectionCreate.userErrors.length > 0) {
      console.error(
        "Error in createCollection2:",
        JSON.stringify(responseJson.data.collectionCreate.userErrors),
      );
      return false;
    }
    return responseJson.data.collectionCreate.collection;
  } catch (error) {
    console.error("Error in createCollection:", JSON.stringify(error));
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
        //save info of collection to metaobject
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

        //auto approve vendors collection if enabled from settings, maybe async update these ids if changed, else it will fail
        const setting = await getSetting(shop, "auto_publish_vendors");
        if (setting && JSON.parse(setting.auto_publish_vendors).length > 0) {
          const responsePublish = await admin.graphql(PUBLISH_MUTATION, {
            variables: {
              id: collection.id,
              input: JSON.parse(setting.auto_publish_vendors).map(
                (publicationId) => ({
                  publicationId: publicationId,
                }),
              ),
            },
          });

          const responsePublishJson = await responsePublish.json();
          console.log(JSON.stringify(responsePublishJson));
        }

        //send email to vendor and admin
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
