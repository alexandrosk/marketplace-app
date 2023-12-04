import db from "../db.server";

export async function updateAllVariants(shop, variant) {
  try {
    return await db.variants.upsert({
      where: { shop: shop, id: variant.id ?? 0 },
      update: {
        title: variant.title,
        key: variant.key,
        values: variant.values,
        // Add any other fields that need to be updated
      },
      create: {
        id: variant.id,
        shop: shop,
        title: variant.title,
        key: variant.key,
        values: variant.values, // Assuming 'values' is stored as a JSON string
        // Add any other fields that are required for creating a new variant
      },
    });
  } catch (error) {
    console.error(error);
    throw error; // It's good practice to rethrow the error so the caller can handle it
  }
}

export async function getVariants(shop) {
  try {
    return await db.variants.findMany({
      where: { shop },
    });
  } catch (error) {
    console.log(error);
  }
}
