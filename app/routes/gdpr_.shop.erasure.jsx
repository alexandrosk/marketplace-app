import { authenticate } from "../shopify.server";
import db from "~/db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, payload, admin } =
    await authenticate.webhook(request);
  console.log("shop erasure", topic, shop, session, payload, admin);
  db.session.deleteMany({ where: { shop } });
  db.settings.deleteMany({ where: { shop } });
  return new Response("shop erasure", { status: 200 });
};
