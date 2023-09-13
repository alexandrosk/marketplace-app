import db from '../db.server'

export async function updateSetting(shop, resourceId, value) {
  try {
    return await db.settings.update({
      // @ts-ignore
      where: { shop },
      data: { [resourceId]: value }
    });
  } catch (error) {
    console.log(error);
  }
}
