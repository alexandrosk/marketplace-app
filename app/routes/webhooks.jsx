import { authenticate } from "../shopify.server";
import db from "../db.server";
import { metaobject_update } from "~/webhooks/metaobject_update";
export const action = async ({ request }) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        console.log("APP_UNINSTALLED");
        //await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "METAOBJECTS_UPDATE":
      console.log("METAOBJECTS_UPDATE");
      metaobject_update(topic, shop, session, payload);
    case "PRODUCTS_UPDATE":
      console.log("PRODUCTS_UPDATE", payload);
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
