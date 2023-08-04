import React from "react";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix";
import {MetafieldProvider} from "~/context/AppMetafields";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const {admin, session} = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      query {
        currentAppInstallation {
          id
          activeSubscriptions {
            id
            name
            status
            test
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
   `);

  const responseJson = await response.json();
  console.log(JSON.stringify(responseJson.data.currentAppInstallation.metafields));

  return json({
    polarisTranslations: require("@shopify/polaris/locales/en.json"),
    apiKey: process.env.SHOPIFY_API_KEY,
    initialAppInstallationId: responseJson.data.currentAppInstallation.id,
    currentSubscription: responseJson.data.currentAppInstallation.activeSubscriptions[0],
    session: session,
    metafields: responseJson.data.currentAppInstallation.metafields.edges.map(({node}) => node),
  });
}

export default function App() {
  const { apiKey, polarisTranslations } = useLoaderData();
  const data = useLoaderData();
  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key={apiKey}
      />
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
        <Link to="/app/billing">Billing</Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/onboarding">Onboarding</Link>
        <Link to="/app/seller/1">Seller</Link>

      </ui-nav-menu>
      <PolarisAppProvider
        i18n={polarisTranslations}
        linkComponent={RemixPolarisLink}
      >
        <MetafieldProvider {...data}>
          <Outlet />
        </MetafieldProvider>
      </PolarisAppProvider>
    </>
  );
}

/** @type {any} */
const RemixPolarisLink = React.forwardRef((/** @type {any} */ props, ref) => (
  <Link {...props} to={props.url ?? props.to} ref={ref}>
    {props.children}
  </Link>
));

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
