import { Box, InlineGrid, InlineStack, Page, Text } from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import { useEffect, useState } from "react";

import { useActionData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useSettings } from "~/context/AppSettings";
import { PricingCard } from "~/components/PricingCard";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const name = formData.get("name");

  const response = await admin.graphql(
    `#graphql
      mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
      appSubscriptionCreate(
        name: $name,
        returnUrl: $returnUrl,
        lineItems: $lineItems,
        test: true,
        trialDays: 14
         ) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`,
    {
      variables: {
        name: name,
        returnUrl:
          "https://newathens.myshopify.com/admin/apps/marketplace-p2p/app/billing",
        test: true,
        trialDays: 14,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: 49.0,
                  currencyCode: "USD",
                },
                interval: "EVERY_30_DAYS",
              },
            },
          },
        ],
      },
    },
  );

  const responseJson = await response.json();
  if (responseJson.errors) {
    return json({ errors: responseJson.errors }, { status: 400 });
  }
  //create a href with redirect and click
  redirect(responseJson.data.appSubscriptionCreate.confirmationUrl);
  return json({
    subscriptionUrl: responseJson.data.appSubscriptionCreate.confirmationUrl,
  });
}

export default function BillingPage() {
  const submit = useSubmit();
  const { state, dispatch } = useSettings();

  const createSubscription = (plan) =>
    submit(
      {
        name: plan,
      },
      { replace: true, method: "POST" },
    );
  const { subscriptionUrl } = useActionData() || {};
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    if (subscriptionUrl) {
      //create a and click
      var link = document.createElement("a");
      link.href = subscriptionUrl;
      link.target = "_top";
      document.body.appendChild(link);
      link.click();
    }
  }, [subscriptionUrl]);

  if (state) {
  }

  useEffect(() => {
    //depending on the active subscription go and add a style to the existing plan
    //find the activePlan and add a class to it
    if (state) {
      setActivePlan(state.activePlan);
    }
  }, [state]);

  return (
    <Page
      divider
      title="Billing"
      //primaryAction={{ content: "View on your store", disabled: true }}
      secondaryActions={[
        {
          content: "Pricing Docs",
          onAction() {
            window.open("https://www.multivendorshop.com/docs/admin/pricing");
          },
        },
      ]}
    >
      <InlineGrid gap={"400"} columns={1}>
        <Text variant="heading2xl" as="h2">
          Choose a plan
        </Text>
        <Text variant="bodySm" as="h2">
          Start your 14-day free trial today.
        </Text>
      </InlineGrid>
      <Box padding="400"></Box>
      <InlineStack gap={"400"}>
        <InlineStack gap="600">
          <PricingCard
            title="Basic"
            featuredText="Most Popular"
            description="For stores that are growing and need a reliable solution to scale with them"
            features={[
              "100% API Access (everything based on native Shopify)\n",
              "Unlimited Vendors",
              "Unlimited Products per Vendor",
              "Full control over metaobjects",
              "Email support",
              "Onboarding from Docs and Tutorials",
            ]}
            price="$49"
            frequency="month"
            button={{
              content: "Select Plan",
              props: {
                variant: "primary",
                onClick: () => createSubscription("basic"),
              },
            }}
          />
          <PricingCard
            title="Premium"
            description="The best of the best, for stores that have the highest order processing needs"
            features={[
              "Everything from basic plan",
              "Support per email",
              "Another really cool feature",
              "24/7 Customer Support",
            ]}
            price="$99"
            frequency="month"
            button={{
              content: "Disabled",
              props: {
                variant: "disabled",
                onClick: () => alert("Work in progress"),
              },
            }}
          />
        </InlineStack>
      </InlineStack>
    </Page>
  );
}
