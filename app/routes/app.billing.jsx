import {
  Badge,
  Card,
  InlineGrid,
  Button,
  Text,
  Page,
  IndexTable,
} from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import { useState, useEffect } from "react";

import { useSubmit, useActionData, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useSettings } from "~/context/AppSettings";

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
        trialDays: 7,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: 10.0,
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

  const selectPlan = (plan) => () => {
    createSubscription(plan);
  };

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

  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      primary: false,
    },
    {
      name: "Pro Plan",
      price: "$20",
      primary: true,
    },
    {
      name: "Premium Plan",
      price: "$50",
      primary: true,
    },
  ];

  return (
    <Page
      divider
      title="Billing"
      primaryAction={{ content: "View on your store", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
      ]}
    >
      <InlineGrid gap="4">
        <Text variant="heading2xl" as="h2">
          Choose a plan
        </Text>
        <Text variant="bodySm" as="h2">
          Start your 14-day free trial today.
        </Text>
        <InlineGrid gap="4">
          {plans.map((plan) => {
            return (
              <PricingOption
                plan={plan.name}
                price={plan.price}
                primary={plan.primary}
                onClick={selectPlan(plan.name)}
                active={activePlan === plan.name}
              />
            );
          })}
        </InlineGrid>
      </InlineGrid>
    </Page>
  );
}

const PricingOption = ({ plan, price, primary, onClick, active }) => (
  <div id={plan}>
    <Card>
      {primary && <Badge status="info">Recommended</Badge>}
      {active && <Badge status="success">Active</Badge>}
      <Text variant="headingMd" as="h2">
        {plan}
      </Text>
      <p>{price} per month</p>
      {!active && (
        <Button primary={primary} onClick={onClick}>
          Choose Plan
        </Button>
      )}
    </Card>
  </div>
);
