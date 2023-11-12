import { json } from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import { getAllSettings } from "~/models/settings.server";
import { unauthenticated } from "~/shopify.server";
export async function loader({ request }) {
  verifySignature(request.url);
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");

  const { admin, session } = await unauthenticated.admin(shop ?? "");
  const settings = await getAllSettings(session.shop);
  console.log(settings);
  return json({
    settings: settings,
    products: [
      {
        id: 1,
        title: "Product 4",
        description: "This is product 1",
        price: 100,
      },
      {
        id: 2,
        title: "Product 5",
        description: "This is product 2",
        price: 200,
      },
    ],
  });
}
