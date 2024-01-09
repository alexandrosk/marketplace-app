import { authenticate } from "../shopify.server";
import {
  metaobject_create,
  metaobject_update,
} from "~/webhooks/metaobject_update";
import { orders_update } from "~/webhooks/orders_update";

export const action = async ({ request }) => {
  const { topic, shop, session, payload, admin } =
    await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        console.log("APP_UNINSTALLED");
        //await db.session.deleteMany({ where: { shop } });
        return new Response("uninstalled", { status: 200 });
      }
      break;
    case "METAOBJECTS_UPDATE":
      console.log("METAOBJECTS_UPDATE");
      metaobject_update(admin, topic, shop, session, payload);
      return new Response("metaobject_update", { status: 200 });
    case "METAOBJECTS_CREATE":
      console.log("METAOBJECTS_CREATE");
      metaobject_create(topic, shop, session, payload);
      return new Response("metaobject_create", { status: 200 });
    case "PRODUCTS_UPDATE":
      console.log("PRODUCTS_UPDATE", payload);
      return new Response("product_update", { status: 200 });
    case "ORDERS_UPDATED":
      orders_update(admin, shop, payload, session);
      return new Response("orders_update", { status: 200 });
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
