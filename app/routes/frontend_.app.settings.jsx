import { json } from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import { getAllSettings } from "~/models/settings.server";
import { getVariants } from "~/models/variants.server";
import { unauthenticated } from "~/shopify.server";

function formatCategoriesQuery(categories) {
  return categories
    .map((cat) => {
      const match = cat.match(/gid:\/\/shopify\/Collection\/(\d+)/);
      return match ? `id:${match[1]}` : "";
    })
    .filter(Boolean)
    .join(" OR ");
}
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");

  const { admin, session } = await unauthenticated.admin(shop ?? "");
  const settings = await getAllSettings(session.shop);
  const variants = await getVariants(session.shop);

  //get through settings.allowed_categories and get category names from shopify by id and add to settings.allowed_categories
  const formattedQuery = formatCategoriesQuery(settings?.allowed_categories);

  const response = await admin.graphql(
    `#graphql
      query GetCollections($query: String!) {
          shop {
              collections(first: 10, query: $query) {
                  edges {
                      node {
                          title
                           id
                      }
                  }
              }
          }
      }
  `,
    {
      variables: {
        query: formattedQuery,
      },
    },
  );
  const responseJson = await response.json();
  if (settings && responseJson.data.shop.collections.edges) {
    settings.allowed_categories = responseJson.data.shop.collections.edges;
  }

  return json({
    settings: settings,
    variants: variants,
  });
}
