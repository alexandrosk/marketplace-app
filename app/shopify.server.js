import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  // @ts-ignore
  apiVersion: "2024-01",
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.SingleMerchant,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    /*PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },*/
    ORDERS_UPDATED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  /*logger: {
    level: LogSeverity.Debug,
  },*/
  hooks: {
    afterAuth: async ({ session, admin }) => {
      shopify.registerWebhooks({ session });

      // Create webhook subscription for metaobjects since it doesnt exist on api
      const { accessToken, shop } = session;
      try {
        const response = await fetch(
          `https://${shop}/admin/api/${apiVersion}/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            },
            body: JSON.stringify({
              query: `mutation {
                webhookSubscriptionCreate1: webhookSubscriptionCreate(
                  topic: METAOBJECTS_UPDATE
                  subTopic: "type:vendors"
                  webhookSubscription: {callbackUrl: "${process.env.SHOPIFY_APP_URL}/webhooks", format: JSON}
                ) {
                  userErrors {
                    field
                    message
                  }
                  webhookSubscription {
                    id
                  }
                }
              }`,
            }),
          },
        );
        const responseJson = await response.json();
        console.log(JSON.stringify(responseJson));
      } catch (error) {
        console.log(JSON.stringify(error));
      }
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = "2024-01";
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
