import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session, payload, admin } =
    await authenticate.webhook(request);
  console.log("data request", topic, shop, session, payload, admin);
  return new Response("data request", { status: 200 });
};
