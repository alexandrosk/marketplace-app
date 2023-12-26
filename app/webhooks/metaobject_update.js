//METAOBJECTS_CREATE && METAOBJECTS_UPDATE && METAOBJECTS_DELETE
//should send email to admin if vendor is created, also to vendor if vendor is approved
//if vendor deactivates shop, also deactivate collection & products
//if vendor is approved, create related collection
//https://shopify.dev/docs/api/admin-graphql/2024-01/enums/WebhookSubscriptionTopic

export const metaobject_update = async (topic, shop, session, payload) => {
  if (payload.vendor && payload.vendor === "Vendors") {
    console.log("metaobject_update", topic, shop, payload, session);
  }
};
