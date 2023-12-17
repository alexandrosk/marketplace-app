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
  Toast,
  Tag,
  Frame,
  Modal,
  ChoiceList,
  Link,
} from "@shopify/polaris";

import { json } from "@remix-run/node";
import React, { useCallback, useEffect, useState } from "react";
import { updateAllSettings } from "~/models/settings.server";
import { updateAllVariants } from "~/models/variants.server";
import { settingsHook } from "~/hooks/useSettings";
import { authenticate } from "~/shopify.server";
import { useSettings } from "~/context/AppSettings";
import { useLoaderData, useSubmit } from "@remix-run/react";
import db from "~/db.server";
import { boolean } from "zod";
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = new URLSearchParams(await request.text());

  let settings = formData.get("settings");
  let variants = formData.get("variants");

  try {
    const settingsCallback = await updateAllSettings(
      session.shop,
      JSON.parse(settings),
    );

    JSON.parse(variants).map(async (variant) => {
      const variantsCallback = await updateAllVariants(session.shop, variant);
      console.log(variantsCallback);
    });

    if (settingsCallback) {
      return json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.log(error);
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
  const variants = await db.variants.findMany({
    where: { shop: session.shop },
  });

  return {
    shop: session.shop,
    collections: responseJson.data.collections.edges,
    variantsDb: variants,
  };
};

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { collections, variantsDb, shop } = useLoaderData();
  const { smUp } = useBreakpoints();
  const [allOptions, setAllOptions] = useState([]);
  const [activeToast, setActiveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Variant already exists");
  const submit = useSubmit();
  const [leftItems, setLeftItems] = useState(
    collections.map((collection) => collection.node.id),
  );
  const [rightItems, setRightItems] = useState(
    state.settings.allowed_categories,
  );
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  const [newVariant, setNewVariant] = useState("");
  const [variants, setVariants] = useState(variantsDb);

  //toast handle
  const toggleActiveToast = useCallback(
    () => setActiveToast((active) => !active),
    [],
  );

  const handleVariantChange = (value) => {
    setNewVariant(value);
  };
  const handleAddVariant = () => {
    //dont add if already exists
    if (variants.find((v) => v.title === newVariant)) {
      setToastMessage("Variant already exists");
      toggleActiveToast();
      return;
    }

    if (newVariant) {
      setVariants([...variants, { title: newVariant, values: "[]" }]);
      setNewVariant("");
    }
  };
  function removeTag(variant) {
    return () => {
      setVariants(variants.filter((v) => v.title !== variant.title));
    };
  }

  useEffect(() => {
    const options = collections.map((collection) => ({
      label: collection.node.title,
      value: collection.node.id,
    }));
    setAllOptions(options);
  }, [collections]);

  const toastMarkup = activeToast ? (
    <Toast content={toastMessage} onDismiss={toggleActiveToast} />
  ) : null;

  useEffect(() => {
    // Ensure allowed_categories is an array before proceeding
    const allowedCategoryIds = Array.isArray(state.settings.allowed_categories)
      ? state.settings.allowed_categories
      : [];

    setLeftItems(
      collections
        .map((collection) => collection.node.id)
        .filter((id) => !allowedCategoryIds.includes(id)),
    );
  }, [state.settings.allowed_categories, collections]);

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

  const [activeModal, setActiveModal] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [variantValues, setVariantValues] = useState("");

  const handleVariantValuesChange = (value) => {
    setVariantValues(value);
  };

  const handleTagClick = (variant) => {
    setCurrentVariant(variant);

    const valuesArray = variant.values
      ? JSON.parse(variant.values)
          .map((item) => item.label)
          .join(", ")
      : "";
    setVariantValues(valuesArray);

    setActiveModal(true);
  };

  const handleModalClose = () => {
    setActiveModal(false);
    setCurrentVariant(null);
    setVariantValues("");
  };

  const handleModalSubmit = () => {
    // Convert the string back to JSON format
    const updatedValues = JSON.stringify(
      variantValues.split(",").map((value) => ({
        label: value.trim(),
        value: `gid://shopify/Collection/${value.trim()}`,
      })),
    );

    const updatedVariants = variants.map((v) =>
      v.id === currentVariant.id ? { ...v, values: updatedValues } : v,
    );
    setVariants(updatedVariants);
    handleModalClose();
  };

  const handleSubmit = (event) => {
    const formData = new FormData();
    formData.append("variants", JSON.stringify(variants));
    state.settings.allowed_categories = rightItems;
    //state.settings.id = undefined;
    formData.append("settings", JSON.stringify(state.settings));
    submit(formData, { method: "post", action: "/app/settings" });

    setToastMessage("Settings saved!");
    toggleActiveToast();
  };

  return (
    <Page
      title="Settings"
      primaryAction={{
        content: "Save",
        disabled: rightItems.length === 0,
        onAction: () => {
          handleSubmit();
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
      <Frame>
        {toastMarkup}
        <Modal
          open={activeModal}
          onClose={handleModalClose}
          title={`Add values to ${currentVariant?.title}`}
          primaryAction={{
            content: "Add",
            onAction: handleModalSubmit,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleModalClose,
            },
          ]}
        >
          <Modal.Section>
            <TextField
              label="Values"
              value={variantValues}
              onChange={handleVariantValuesChange}
              placeholder="e.g., Small, Medium, Large"
            />
          </Modal.Section>
        </Modal>
        {/*{JSON.stringify(variantsDb)}*/}
        <BlockStack gap={{ xs: "800", sm: "400" }}>
          {console.log(state.settings)}
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
            <Box as="section">
              <InlineStack gap="4">
                <Text as="h3" variant="headingMd">
                  Variant Assigments
                </Text>
                <Text as="p" variant="bodyMd">
                  Variants that vendors will be able to use. <br />
                  <b>NOTE:</b> Add a new variant and select options for each
                  one.
                </Text>
              </InlineStack>
            </Box>

            <Card>
              <BlockStack gap="400">
                <TextField
                  label="Add Variant"
                  placeholder="e.g., Size"
                  value={newVariant}
                  onChange={handleVariantChange}
                />
                <Button onClick={handleAddVariant} size={"slim"}>
                  Add Variant
                </Button>
                <InlineStack gap={"100"}>
                  {variants.map((variant) => (
                    <Tag key={variant.title} onRemove={removeTag(variant)}>
                      <Link to="#" onClick={() => handleTagClick(variant)}>
                        {variant.title}
                      </Link>
                    </Tag>
                  ))}
                </InlineStack>
              </BlockStack>
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
                  label="Default Commission (%)"
                  type="number"
                  value={
                    state.settings.default_commision
                      ? state.settings.default_commision
                      : 0
                  }
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "default_commision",
                      value: parseFloat(value),
                    })
                  }
                  helpText="This is the default commission that will be applied to all products. You can override this on a per vendor or product basis."
                  autoComplete="commission"
                />
              </BlockStack>
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
                  Approval of Vendor and Products
                </Text>
                <Text as="p" variant="bodyMd">
                  Enable Auto product approval and vendor approval. <br />
                  If disabled, you will have to manually approve vendors and
                  products. <br />
                  You will get an email when a vendor or product is submitted
                  for approval.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <ChoiceList
                  title="Auto Publish Products"
                  choices={[
                    { label: "Enabled", value: "true" },
                    { label: "Disabled", value: "false" },
                  ]}
                  selected={[state.settings.auto_publish_products]}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "auto_publish_products",
                      value: value[0],
                    })
                  }
                />
                <ChoiceList
                  title="Auto Approve Vendors"
                  choices={[
                    { label: "Enabled", value: "true" },
                    { label: "Disabled", value: "false" },
                  ]}
                  selected={[state.settings.auto_approve]}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "auto_approve",
                      value: value[0],
                    })
                  }
                />
              </BlockStack>
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
                  Shipping
                </Text>
                <Text as="p" variant="bodyMd">
                  Let users add location for shipping.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <ChoiceList
                  title="Let vendors add their shipping location and handle shipping"
                  choices={[
                    { label: "Enabled", value: "true" },
                    { label: "Disabled", value: "false" },
                  ]}
                  selected={[state.settings.allows_shipping]}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "allows_shipping",
                      value: value[0],
                    })
                  }
                  helpText="If disabled, you should handle shipping yourself."
                />
              </BlockStack>
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
                  Emails
                </Text>
                <Text as="p" variant="bodyMd">
                  Set email from and templates
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <TextField
                  label="Email From"
                  type="email"
                  value={state.settings.from_email}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "from_email",
                      value: value,
                    })
                  }
                  autoComplete="from_email"
                />
                <TextField
                  label="Resend API Key"
                  type="text"
                  value={state.settings.from_email_api_key}
                  onChange={(value) =>
                    dispatch({
                      type: "SET_SETTING",
                      resourceId: "from_email_api_key",
                      value: value,
                    })
                  }
                  helpText={
                    "If no API key is added, default email from\n" +
                    "              info@multivendorshop.com will be used." +
                    "              Changing templates will be released soon."
                  }
                  autoComplete="from_email_api_key"
                />
                <p>
                  Get your key from{" "}
                  <a href="https://resend.com/onboarding">Resend</a> (100 free
                  per day/ 3,000 per month)
                </p>
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
      </Frame>
    </Page>
  );
}
