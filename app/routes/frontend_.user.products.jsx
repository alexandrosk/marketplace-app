import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server"; // Adjust this import path as needed
import { PRODUCT_LIST_BY_METAFIELD_QUERY } from "~/graphql/queries/productListByMetafield";
import { CREATE_PRODUCT_MUTATION } from "~/graphql/mutations/createProduct";
import { uploadFile } from "~/models/files.server";

const fetchProductsByMetafield = async (storefront, vendorSlug) => {
  const response = await storefront.graphql(PRODUCT_LIST_BY_METAFIELD_QUERY, {
    variables: { vendorSlug: vendorSlug },
  });
  const responseJson = await response.json();
  console.log(JSON.stringify(responseJson));
  if (!responseJson.data.collection) {
    return [];
  }
  return responseJson.data.collection.products.edges.map(({ node }) => ({
    handle: "products/" + node.handle,
    id: node.id,
    title: node.title,
    description: node.description,
    price: node.priceRange.minVariantPrice.amount,
    images: node.images.edges.map(({ node }) => node.originalSrc),
  }));
};

/**
 * Create product in Shopify
 * @param admin
 * @param productData
 * @param files
 * @returns {Promise<*>}
 */
const createProductInShopify = async (admin, productData, files) => {
  const imageUploads = await uploadFile(files, admin.graphql);

  const shopifyProductData = {
    title: productData.title,
    options: productData.variantOptions,
    metafields: [
      {
        namespace: "vendor",
        key: "customer_id",
        value: productData.customerId,
      },
      {
        namespace: "vendor",
        key: "vendor_id",
        value: productData.vendorId,
      },
    ],
    descriptionHtml: productData.descriptionHtml,
    variants: [
      {
        price: productData.price,
        options: productData.variantValues,
      },
    ],

    collectionsToJoin: [productData.category],
  };
  const shopifyProductImages = imageUploads.stagedTargets?.map((file) => ({
    originalSource: file.resourceUrl,
    mediaContentType: "IMAGE",
  }));
  console.log(JSON.stringify(shopifyProductData));
  const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
    variables: {
      input: shopifyProductData,
      media: shopifyProductImages,
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
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const vendorSlug = searchParams.get("vendorSlug");
  if (!shop || !vendorSlug) {
    return json(
      { error: "Shop or Customer ID parameter is missing" },
      { status: 400 },
    );
  }
  const { storefront } = await authenticate.public.appProxy(request);

  const products = await fetchProductsByMetafield(storefront, vendorSlug);

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
  // Use FormData to parse the request body
  const formData = await request.formData();
  let productData = {};
  let files = [];
  let variantOptions = new Set();
  productData.variantValues = [];

  for (let [key, value] of formData) {
    if (value instanceof File) {
      files.push(value);
    } else if (key.startsWith("variants[")) {
      const variantName = key.match(/variants\[(.*?)\]/)[1];
      variantOptions.add(variantName);
      productData.variantValues.push(value);
    } else {
      productData[key] = value;
    }
  }

  productData.variantOptions = Array.from(variantOptions);
  productData.customerId = searchParams.get("logged_in_customer_id");

  if (!shop || !productData) {
    return json({ error: "Missing shop or product data" }, { status: 400 });
  }

  const { admin } = await authenticate.public.appProxy(request);
  try {
    const response = await createProductInShopify(admin, productData, files);
    console.log(JSON.stringify(response));
    if (response.data.productCreate?.userErrors.length > 1) {
      return json(
        { error: response.data.productCreate.userErrors[0].message },
        { status: 400 },
      );
    }

    return json({
      message: "Product created successfully",
      productId: response.data.productCreate.product.id,
    });
  } catch (error) {
    console.error(error);
    return json({ error: error.message }, { status: 400 });
  }
};
