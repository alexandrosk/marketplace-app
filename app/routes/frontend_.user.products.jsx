import { json } from "@remix-run/node";
import { unauthenticated } from "~/shopify.server"; // Adjust this import path as needed
import { PRODUCT_LIST_BY_METAFIELD_QUERY } from "~/graphql/queries/productListByMetafield";
import { CREATE_PRODUCT_MUTATION } from "~/graphql/mutations/createProduct";
const fetchProductsByMetafield = async (admin, customerId) => {
  const response = await admin.graphql(PRODUCT_LIST_BY_METAFIELD_QUERY, {
    variables: { customerId },
  });
  const responseJson = await response.json();

  return responseJson.data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    price: node.priceRange.minVariantPrice.amount,
  }));
};

/**
 * Create product in Shopify
 * @param admin
 * @param productData
 * @returns {Promise<*>}
 */
const createProductInShopify = async (admin, productData) => {
  console.log(productData);
  const shopifyProductData = {
    title: productData.title,
    metafields: [
      {
        namespace: "vendor",
        key: "customer_id",
        value: "1111",
      },
    ],
    descriptionHtml: productData.descriptionHtml,
    variants: [
      {
        price: productData.price,
      },
    ],
    collectionsToJoin: [productData.category],
  };
  const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
    variables: {
      input: shopifyProductData,
    },
  });
  const responseJson = await response.json();
  return responseJson;
};

/**
 *
 * @param request
 * @returns {Promise<(Omit<Response, "json"> & {json(): Promise<{error: string}>})|(Omit<Response, "json"> & {json(): Promise<{products: *}>})>}
 */
export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const customerId = url.searchParams.get("customer_id");

  if (!shop || !customerId) {
    return json(
      { error: "Shop or Customer ID parameter is missing" },
      { status: 400 },
    );
  }

  const { admin } = await unauthenticated.admin(shop);
  const products = await fetchProductsByMetafield(admin, customerId);

  return json({ products });
}

/**
 * Create product
 * @param request
 * @returns {Promise<(Omit<Response, "json"> & {json(): Promise<{error: string}>})|(Omit<Response, "json"> & {json(): Promise<{error}>})|(Omit<Response, "json"> & {json(): Promise<{productId: string | string, message: string}>})>}
 */
export let action = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const customerId = searchParams.get("logged_in_customer_id");

  const awaitRequest = await request.text();
  let productData = JSON.parse(awaitRequest);

  if (!shop || !productData) {
    return json({ error: "Missing shop or product data" }, { status: 400 });
  }

  const { admin } = await unauthenticated.admin(shop);
  try {
    const response = await createProductInShopify(admin, productData);
    console.log(response);
    if (response.productCreate.userErrors.length > 0) {
      return json(
        { error: response.productCreate.userErrors[0].message },
        { status: 400 },
      );
    }

    return json({
      message: "Product created successfully",
      productId: response.productCreate.product.id,
    });
  } catch (error) {
    console.error(error);
    return json({ error: error.message }, { status: 400 });
  }
};
