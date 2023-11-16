import db from "../db.server";

export async function updateAllVariants(shop, variants) {
  try {
    return await db.settings.create({
      // @ts-ignore
      where: { shop },
      data: { ...variants },
    });
  } catch (error) {
    console.log(error);
  }
}
