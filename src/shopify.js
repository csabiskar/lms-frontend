import { createApp } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge-utils";

let appInstance = null;

export function getApp() {
  if (appInstance) return appInstance;

  const params = new URLSearchParams(window.location.search);
  const host = params.get("host");

  if (!host) {
    throw new Error("Missing 'host' query parameter. The app must be loaded inside the Shopify Admin.");
  }

  appInstance = createApp({
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host,
    forceRedirect: true,
  });

  return appInstance;
}

export async function getToken() {
  const app = getApp();
  return await getSessionToken(app);
}
