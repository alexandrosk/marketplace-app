import {
  Box, Button,
  Card, Collapsible, EmptyState, HorizontalGrid, HorizontalStack, Icon,
  Layout,
  Link,
  List,
  Page, ProgressBar,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import {ChevronDownMinor, ChevronUpMinor, CircleDotsMajor} from "@shopify/polaris-icons";
import React, {useEffect, useState} from "react";
import {useSettings} from "~/context/AppSettings";
import {authenticate} from "~/shopify.server";
import {json} from "@remix-run/node";
import {useActionData, useNavigation, useSubmit} from "@remix-run/react";

export async function action({ request }) {
  const { admin, session,  sessionToken } = await authenticate.admin(request);

  const formData = await request.formData();
  const state = JSON.parse(formData.get("state"));

  const response = await admin.graphql(
    `#graphql
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          access {
            storefront
          }
          capabilities {
            publishable {
              enabled
            }
          }
          name
          type
          fieldDefinitions {
            name
            key
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      variables: {
        "definition": {
          "access": {
            /*"admin": "MERCHANT_READ_WRITE",*/
            "storefront": "PUBLIC_READ"
          },
          "capabilities": {
            "publishable": {
              "enabled": true
            }
          },
          "name": "Shop",
          "type": "shop",
          "fieldDefinitions": [
            {
              "name": "Title",
              "key": "title",
              "type": "single_line_text_field",
              "validations": [
                {
                  "name": "regex",
                  "value": "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                }
              ]
            },
            {
              "name": "Description",
              "key": "description",
              "type": "multi_line_text_field"
            },
            {"name": "slug", "key": "slug", type: "single_line_text_field"},
            {"name": "enabled", "key": "enabled", type: "boolean"},
            {"name": "product", "key": "product", type: "product_reference"},
            {"name": "rating", "key": "rating", type: "rating", validations: [
                {
                  "name": "scale_min",
                  "value": "0"
                },
                {
                  "name": "scale_max",
                  "value": "5"
                },
              ]
            },
            {"name": "rating_total", "key": "rating_total", type: "number_integer"},
            {"name": "social", "key": "social", type: "json"},
            {"name": "image", "key": "image", type: "file_reference"},
            {"name": "color", "key": "background", type: "color"},
            /*{"name": "sold_items", "key": "sold_items"},
            {"name": "shipping_methods", "key": "shipping_methods", type: "collection_reference"},*/
            {"name": "country", "key": "country", type: "single_line_text_field"},
            {"name": "paypal_email", "key": "paypal_email","type": "single_line_text_field"},
            {"name": "product_list", "key": "product_list", type: "collection_reference"},
          ]
        }
      }
    }
  );
  const responseJson = await response.json();

  return json(responseJson.data);
}
export default function SellersPage() {
  const { state, dispatch } = useSettings();

  const [collapsibleStates, setCollapsibleStates] = useState({
    1: true,
    2: false,
    3: false,
  });

  const handleCollapsibleToggle = (id) => {
    setCollapsibleStates((prevStates) => ({
      ...prevStates,
      [id]: !prevStates[id],
    }));
  };
  const nav = useNavigation();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const actionData = useActionData();
  const submit = useSubmit();
  const generateMetaobject = () => submit({
    state: JSON.stringify(state),
  }, { replace: true, method: "POST" });

  useEffect(() => {
    console.log(actionData);
    if (actionData && actionData.success) {
      alert("Metaobject created");
    }
  }, [actionData]);

  return (
    <Page
        divider
        title={"Sellers"}
        primaryAction={{ content: "View on your store", disabled: true }}
        secondaryActions={[
          {
            content: "Duplicate",
            accessibilityLabel: "Secondary action label",
            onAction: () => alert("Duplicate action"),
          },
        ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <VerticalStack gap="3">
              {JSON.stringify(state)}
              {state?.settings?.length ? (
                <List>

                </List>
              ) : (
                <Text as={"h3"}>No settings found</Text>
              )}

              <EmptyState
                heading="Create your first seller"
                action={{
                  content: "Create seller metaobject",
                  onAction: () => generateMetaobject(),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Allow customers to scan codes and buy products using their phones.</p>
              </EmptyState>
            </VerticalStack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <VerticalStack gap="2">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List spacing="extraTight">
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </VerticalStack>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="1"
      paddingInlineEnd="1"
      background="bg-subdued"
      borderWidth="1"
      borderColor="border"
      borderRadius="1"
    >
      <code>{children}</code>
    </Box>
  );
}
