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
import React, {useState} from "react";
import {useMetafields} from "~/context/AppMetafields";
import {authenticate} from "~/shopify.server";

export async function action({request}){
  const {admin} = await authenticate.admin(request);
  const formData = await request.formData();
  const metafieldsInput = JSON.parse(formData.get("metafields"));

  const mutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(mutation, {});
    // Do something with the response, like redirecting the user or sending back some data
  } catch (error) {
    console.error('Failed to update metafields:', error);
    // Handle the error appropriately
  }
}
export default function AdditionalPage() {
  const { state, dispatch } = useMetafields();


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
  return (
    <Page>
      <ui-title-bar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <VerticalStack gap="3">
              {JSON.stringify(state)}
              {state?.metafields?.length ? (
                <List>
                  {state.metafields.map((metafield) => (
                    <List.Item key={metafield.id}>
                          <Text as={"h3"}>{metafield.key}</Text>
                          <Text as={"h3"}>{metafield.value}</Text>
                    </List.Item>
                  ))}
                </List>
              ) : (
                <Text as={"h3"}>No metafields found</Text>
              )}

              <EmptyState
                heading="Create your first seller"
                action={{
                  content: "Create seller",
                  onAction: () => alert("qrcodes/new"),
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
