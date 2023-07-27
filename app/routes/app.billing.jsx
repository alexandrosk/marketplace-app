import { Card, VerticalStack, Button, Text, Page } from '@shopify/polaris';
import { json, redirect } from "@remix-run/node";
import { useState, useEffect } from 'react';

import {
  useSubmit,
  useActionData
} from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  
  const response = await admin.graphql(
    `#graphql
      mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
      appSubscriptionCreate(
        name: $name,
        returnUrl: $returnUrl,
        lineItems: $lineItems,
        test: true,
        trialDays: 7
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
      "variables": {
        "name": "Pro Plan",
        "returnUrl": process.env.SHOPIFY_APP_URL + "/app/billing",
        "test": true,
        "trialDays": 7,
        "lineItems": [
          {
            "plan": {
              "appRecurringPricingDetails": {
                "price": {
                  "amount": 10.0,
                  "currencyCode": "USD"
                },
                "interval": "EVERY_30_DAYS",
              }
            }
          }
        ]
      },
    }
  );

  const responseJson = await response.json();
  if (responseJson.errors) {
    return json({ errors: responseJson.errors }, { status: 400 });
  }
  //create a href with redirect and click 
 redirect(responseJson.data.appSubscriptionCreate.confirmationUrl);
 return json({ subscriptionUrl: responseJson.data.appSubscriptionCreate.confirmationUrl });
  
}


export default function BillingPage() {
  const submit = useSubmit();
  const createSubscription = () => submit({}, { replace: true, method: "POST" })
  const { subscriptionUrl } = useActionData() || {};
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (subscriptionUrl) {
      //create a and click
      var link = document.createElement('a');
      link.href = subscriptionUrl;
      link.target = "_top";
      document.body.appendChild(link);
      link.click();
    }
  }, [subscriptionUrl]);


return (
  <Page
      divider
      primaryAction={{ content: "View on your store", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
      ]}
    >
    <VerticalStack gap="4" >
    <Card >
    <Text variant="headingMd" as="h2">Free Plan</Text>
    <p>0 per month</p>
    <Button primary={true} onClick={createSubscription}>Choose Plan</Button>
  </Card>
      {/* <PricingOption plan="Free" price="$0" primary={false} onClick={createSubscription}/>
      <PricingOption plan="Pro" price="$20" primary onClick={createSubscription} />
      <PricingOption plan="Premium" price="$50" primary onClick={createSubscription} /> */}
    </VerticalStack>
  </Page>
)
    };

const PricingOption = ({ plan, price, primary, onClick }) => (
  <Card >
    <Text variant="headingMd" as="h2">{plan} Plan</Text>
    <p>{price} per month</p>
    <Button primary={primary} onClick={onClick(plan)}>Choose Plan</Button>
  </Card>
);