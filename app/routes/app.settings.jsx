import { Page, Card, TextField, Text, Divider, Box, HorizontalGrid, VerticalStack, useBreakpoints } from "@shopify/polaris";

// This example is for guidance purposes. Copying it will come with caveats.
export default function SettingsPage() {
  const { smUp } = useBreakpoints();
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
      <ui-title-bar title="Settings" />
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
