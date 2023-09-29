import {
  Page,
  Card,
  TextField,
  Text,
  Divider,
  Box,
  HorizontalGrid,
  VerticalStack,
  useBreakpoints,
  Layout,
  Button, List, Select
} from "@shopify/polaris";

import { updateSetting } from '../models/settings.server';
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import React from "react";
import {useSettings} from "~/context/AppSettings";

export let action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let formData = new URLSearchParams(await request.text());
  let resourceId = formData.get('resourceId');
  let value = formData.get('value');

  if (resourceId === 'onboarding_step'){
    // @ts-ignore
    value = parseInt(formData.get('value'));
  }

  try {
    let settings = await updateSetting(session.shop, resourceId, value);
    if (settings) {
      return json({ success: true }, { status: 200 });
    }
  } catch (error) {
    return json({ error: error }, { status: 500 });
  }
};
export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { smUp } = useBreakpoints();
  return (
    <Page
      divider
      title="Settings"
      primaryAction={{ content: "View on your store", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
      ]}
    >

      <VerticalStack gap={{ xs: "8", sm: "4" }}>
        {JSON.stringify(state.settings)}
        <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
          <Box
            as="section"
          >
            <VerticalStack gap="4">
              <Text as="h3" variant="headingMd">
                Product Assignment
              </Text>
              <Text as="p" variant="bodyMd">
                Categorisation, auto categorisation and auto tagging
              </Text>
            </VerticalStack>
          </Box>

          <Card roundedAbove="sm">
            <VerticalStack gap="4">
            <Select label={"Onboarding Step"} value={state.settings.onboarding_step} onChange={(value) => dispatch({type: 'update', payload: {resourceId: 'onboarding_step', value: value}})}
            options={[
              {label: 'Step 0', value: 0},
              {label: 'Step 1', value: 1},
            ]}
            >
            </Select>
            </VerticalStack>
          </Card>
        </HorizontalGrid>

        <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
          <Box
            as="section"
          >
            <VerticalStack gap="4">
              <Text as="h3" variant="headingMd">
                Payments / Commissions
              </Text>
              <Text as="p" variant="bodyMd">
                How to pay your vendors
              </Text>
            </VerticalStack>
          </Box>

          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <TextField autoComplete="" label="Interjamb style" />
              <TextField autoComplete="" label="Interjamb ratio" />
            </VerticalStack>
          </Card>
        </HorizontalGrid>
        {smUp ? <Divider /> : null}
        <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
          <Box
            as="section"
          >
            <VerticalStack gap="4">
              <Text as="h3" variant="headingMd">
                Product Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Setup your product settings, available categories, delivery methods etc
              </Text>
            </VerticalStack>
          </Box>
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <TextField autoComplete="" label="Allowed Categories" />
              <TextField autoComplete="" label="Allowed Tags" />
            </VerticalStack>
          </Card>
        </HorizontalGrid>
      </VerticalStack>
    </Page>
  )
}
