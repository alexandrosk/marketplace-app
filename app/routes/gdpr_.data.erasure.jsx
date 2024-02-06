import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session, payload, admin } =
    await authenticate.webhook(request);
  console.log("data erasure", topic, shop, session, payload, admin);
  return new Response("data erasure", { status: 200 });
};
