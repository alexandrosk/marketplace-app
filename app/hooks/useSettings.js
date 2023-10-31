export function settingsHook() {
  async function updateSetting(resourceId, value) {
    const response = await fetch("/app/settings", {
      method: "POST",
      body: new URLSearchParams({ resourceId, value }),
    });

    if (!response.ok) {
      throw new Error("Failed to update setting");
    }

    return true;
  }

  return { updateSetting };
}
