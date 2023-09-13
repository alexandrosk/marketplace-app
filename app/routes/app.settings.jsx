import { Page, Card, TextField, Text, Divider, Box, HorizontalGrid, VerticalStack, useBreakpoints } from "@shopify/polaris";

import { updateSetting } from '../models/settings.server';
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";

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
        <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
          <Box
            as="section"
          >
            <VerticalStack gap="4">
              <Text as="h3" variant="headingMd">
                InterJambs
              </Text>
              <Text as="p" variant="bodyMd">
                Interjambs are the rounded protruding bits of your puzzlie piece
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
                Dimensions
              </Text>
              <Text as="p" variant="bodyMd">
                Interjambs are the rounded protruding bits of your puzzlie piece
              </Text>
            </VerticalStack>
          </Box>
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <TextField autoComplete="" label="Horizontal" />
              <TextField autoComplete="" label="Interjamb ratio" />
            </VerticalStack>
          </Card>
        </HorizontalGrid>
      </VerticalStack>
    </Page>
  )
}
