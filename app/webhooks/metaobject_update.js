//METAOBJECTS_CREATE && METAOBJECTS_UPDATE && METAOBJECTS_DELETE
//should send email to admin if vendor is created, also to vendor if vendor is approved
//if vendor deactivates shop, also deactivate collection & products
//if vendor is approved, create related collection
//https://shopify.dev/docs/api/admin-graphql/2024-01/enums/WebhookSubscriptionTopic

import { CREATE_COLLECTION } from "~/graphql/mutations/createCollection";

const createCollection = async (admin, shop, session, vendor) => {
  console.log("createCollection");
  const generalInfo = JSON.parse(vendor.fields.general);
  try {
    const response = await admin.graphql(CREATE_COLLECTION, {
      variables: {
        input: {
          handle: vendor.handle,
          templateSuffix: "vendor",
          title: "Shop - " + vendor.fields.title,
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

    if (responseJson.userErrors.length > 0) {
      console.error("Error in createCollection:", JSON.stringify(responseJson));
      return;
    }

    const collection = responseJson.data.collectionCreate.collection;

    //set metafields and publish
    const custom_collection = new admin.rest.resources.CustomCollection({
      session: session,
    });
    custom_collection.id = collection.id;
    custom_collection.metafields = [
      {
        key: "vendor",
        value: vendor.id,
        type: "metaobject_reference",
        namespace: "custom",
      },
    ];
    custom_collection.published = true;

    await custom_collection.save({
      update: true,
    });
  } catch (error) {
    console.error("Error in updateOrderMetafields:", JSON.stringify(error));
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

  const generalInfo = JSON.parse(payload.fields.general);
  if (
    payload.fields.status === '["Approved"]' &&
    generalInfo.previous_status === "pending" &&
    !payload.product_list
  ) {
    await createCollection(admin, shop, session, payload);
  }
  return new Response("metaobject_update", { status: 200 });
};
export const metaobject_create = async (topic, shop, session, payload) => {
  if (payload) {
    console.log("metaobject_create", topic, shop, payload, session);
  }
  return new Response("metaobject_create", { status: 200 });
};
