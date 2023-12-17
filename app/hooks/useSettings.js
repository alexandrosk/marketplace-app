import { updateSetting as updateSettingDb } from "~/models/settings.server";

export function settingsHook() {
  async function updateSetting(shop, resourceId, value) {
    try {
      updateSettingDb(shop, resourceId, value);
    } catch (error) {
      console.log(error);
    }

    return true;
  }

  return { updateSetting };
}
