import {
  Page,
  Card,
  TextField,
  Text,
  Divider,
  Box,
  InlineGrid,
  OptionList,
  InlineStack,
  useBreakpoints,
  BlockStack,
  Button,
} from "@shopify/polaris";

import { json } from "@remix-run/node";
import React, { useCallback, useEffect, useState } from "react";
import { updateSetting, getAllSettings } from "../models/settings.server";
import { settingsHook } from "../hooks/useSettings";
import { authenticate } from "~/shopify.server";
import { useSettings } from "~/context/AppSettings";
import { useLoaderData } from "@remix-run/react";
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = new URLSearchParams(await request.text());
  const resourceId = formData.get("resourceId");
  let value = formData.get("value");

  if (resourceId === "onboarding_step" || resourceId === "default_commision") {
    // @ts-ignore
    value = parseInt(formData.get("value"), 10);
  }

  try {
    const settings = await updateSetting(session.shop, resourceId, value);
    if (settings) {
      return json({ success: true }, { status: 200 });
    }
  } catch (error) {
    return json({ error }, { status: 500 });
  }
  return json({ success: false }, { status: 500 });
};

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const QUERY = `
    {
        collections(first: 100, query: "-vendor") {
        edges {
          node {
            id
            title
            handle
            updatedAt
            productsCount
            sortOrder
          }
        }
      }
    }
  `;

  const variables = {
    first: 1, // You can customize this or make it dynamic
    after: "", // This can be made dynamic based on pagination or cursor
  };

  const response = await admin.graphql(QUERY, { variables });
  const responseJson = await response.json();
  console.log(responseJson.data.collections.edges);
  return {
    shop: session.shop,
    collections: responseJson.data.collections.edges,
  };
};

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { collections, shop } = useLoaderData();
  const { smUp } = useBreakpoints();
  const [allOptions, setAllOptions] = useState([]);
  const [commission, setCommission] = useState(0);
  const { updateSetting } = settingsHook();

  const handleChange = useCallback((value) => {
    setCommission(value);
    dispatch({
      type: "SET_SETTING",
      resourceId: "default_commision",
      value: value,
    });
  }, []);

  useEffect(() => {
    const options = collections.map((collection) => ({
      label: collection.node.title,
      value: collection.node.id,
    }));
    setAllOptions(options);
  }, [collections]);

  useEffect(() => {
    if (state.settings.allowed_categories) {
      try {
        // Parse the JSON string to get the array of allowed categories
        const allowedCategoriesArray = JSON.parse(
          state.settings.allowed_categories,
        );
        const allowedCategoryIds = allowedCategoriesArray.map(
          (cat) => cat.value,
        );
        console.log(allowedCategoryIds);

        // Filter the collections to create the leftItems array, excluding those that are allowed (i.e., on the right)
        setLeftItems(
          collections
            .map((collection) => collection.node.id)
            .filter((id) => !allowedCategoryIds.includes(id)),
        );

        setRightItems(allowedCategoryIds);
      } catch (error) {
        console.error("Error parsing allowed categories:", error);
        // Handle the error or set some default state
      }
    }
    setCommission(state.settings.default_commision);
  }, [state.settings]);

  const [leftItems, setLeftItems] = useState(
    collections.map((collection) => collection.node.id),
  );
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  const moveItems = useCallback(
    (direction) => {
      if (direction === "right") {
        setRightItems([...rightItems, ...selectedLeft]);
        setLeftItems(leftItems.filter((item) => !selectedLeft.includes(item)));
        setSelectedLeft([]);
      } else {
        setLeftItems([...leftItems, ...selectedRight]);
        setRightItems(
          rightItems.filter((item) => !selectedRight.includes(item)),
        );
        setSelectedRight([]);
      }
    },
    [leftItems, rightItems, selectedLeft, selectedRight],
  );
  return (
    <Page
      title="Settings"
      primaryAction={{
        content: "Save",
        disabled: rightItems.length === 0,
        onAction: () => {
          updateSetting("default_commision", commission);
          updateSetting(
            "allowed_categories",
            JSON.stringify(
              allOptions.filter((option) => rightItems.includes(option.value)),
            ),
          );
        },
      }}
      secondaryActions={[
        {
          content: "Reset",
          accessibilityLabel: "Secondary action label",
          onAction: () => window.location.reload(),
        },
      ]}
    >
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        {JSON.stringify(state.settings)}
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box as="section">
            <InlineStack gap="4">
              <Text as="h3" variant="headingMd">
                Product Assignment
              </Text>
              <Text as="p" variant="bodyMd">
                Categories that vendors can assign products to
              </Text>
            </InlineStack>
          </Box>

          <Card>
            <InlineGrid columns={{ md: "2fr 1fr 2fr" }} gap="400">
              <Box>
                <OptionList
                  title="Available Categories"
                  onChange={setSelectedLeft}
                  options={allOptions.filter((option) =>
                    leftItems.includes(option.value),
                  )}
                  selected={selectedLeft}
                  allowMultiple
                />
              </Box>
              <Box>
                <BlockStack align="space-between" gap="200">
                  <Text as="h3" variant="headingMd">
                    &nbsp;
                  </Text>
                  <Button
                    onClick={() => moveItems("left")}
                    disabled={selectedRight.length === 0}
                  >
                    {" < "}
                  </Button>
                  <Button
                    onClick={() => moveItems("right")}
                    disabled={selectedLeft.length === 0}
                  >
                    {" > "}
                  </Button>
                </BlockStack>
              </Box>
              <Box>
                <OptionList
                  title="Selected Categories"
                  verticalAlign="top"
                  onChange={setSelectedRight}
                  options={allOptions.filter((option) =>
                    rightItems.includes(option.value),
                  )}
                  selected={selectedRight}
                  allowMultiple
                />
              </Box>
            </InlineGrid>
          </Card>
        </InlineGrid>

        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Payments
              </Text>
              <Text as="p" variant="bodyMd">
                Set commissions and payment settings
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField
                label="Default Commission"
                type="number"
                value={commission}
                onChange={handleChange}
                helpText="This is the default commission that will be applied to all products. You can override this on a per vendor or product basis."
                autoComplete="commission"
              />
            </BlockStack>
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
        {/*<InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box as="section">
            <InlineGrid>
              <Text as="h3" variant="headingMd">
                Product Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Setup your product settings, available categories, delivery
                methods etc
              </Text>
            </InlineGrid>
          </Box>
          <Card roundedAbove="sm">
            <InlineGrid>
              <TextField autoComplete="" label="Allowed Categories" />
              <TextField autoComplete="" label="Allowed Tags" />
            </InlineGrid>
          </Card>
        </InlineGrid>*/}
      </BlockStack>
    </Page>
  );
}
