import React from "react";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { SettingProvider } from "~/context/AppSettings";
import { authenticate } from "../shopify.server";
import db from "~/db.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const settings = await db.settings.findFirst({
    where: { shop: session.shop },
  });

  if (!settings) {
    await db.settings.create({
      data: {
        shop: session.shop,
        onboarding_step: 0,
      },
    });
  }

  return json({
    polarisTranslations: require("@shopify/polaris/locales/en.json"),
    apiKey: process.env.SHOPIFY_API_KEY,
    currentSubscription: "free",
    session: session,
    settings: settings ?? {},
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
        <Link to="/app/sellers">Vendors</Link>
        <Link to="/app/settings">Settings</Link>
        {/*<Link to="/app/payouts">Payouts</Link>*/}
        <Link to="/app/billing">Subscription</Link>
        {/*<Link to="/app/onboarding">Onboarding</Link>*/}
      </ui-nav-menu>
      <PolarisAppProvider
        i18n={polarisTranslations}
        linkComponent={RemixPolarisLink}
      >
        <SettingProvider {...data}>
          <Outlet />
        </SettingProvider>
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
