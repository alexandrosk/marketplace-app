import db from "../db.server";

export async function updateAllSettings(shop, settings) {
  try {
    return await db.settings.update({
      // @ts-ignore
      where: { shop },
      data: { ...settings },
    });
  } catch (error) {
    console.log(error);
  }
}
export async function updateSetting(shop, resourceId, value) {
  try {
    return await db.settings.update({
      // @ts-ignore
      where: { shop },
      data: { [resourceId]: value },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getAllSettings(shop) {
  try {
    return await db.settings.findFirst({
      // @ts-ignore
      where: { shop },
    });
  } catch (error) {
    console.log(error);
  }
}
export async function getSetting(shop, resourceId) {
  try {
    return await db.settings.findFirst({
      // @ts-ignore
      where: { shop },
      select: { [resourceId]: true },
    });
  } catch (error) {
    console.log(error);
  }
}
