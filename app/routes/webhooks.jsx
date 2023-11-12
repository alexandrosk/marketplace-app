import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        console.log("APP_UNINSTALLED");
        //await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "PRODUCTS_UPDATE":
      console.log("PRODUCTS_UPDATE", request);
      await fetch("http://0.0.0.0:8787/middleware", {
        method: "POST",
        body: request,
        headers: request.headers,
      });
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
