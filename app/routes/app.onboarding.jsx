import {
  AccountConnection,
  Box,
  Card,
  Checkbox,
  ChoiceList,
  FormLayout,
  Layout,
  Page,
  PageActions,
  SettingToggle,
  TextField,
} from "@shopify/polaris";

import React, { useEffect } from "react";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import { json } from "@remix-run/node";
import { useSettings } from "~/context/AppSettings";

export async function action({ request }) {
  const { admin, session, sessionToken } = await authenticate.admin(request);

  const formData = await request.formData();
  const state = JSON.parse(formData.get("state"));

  /*const responseJson = await response.json();
  return json(responseJson.data);*/
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  console.log(
    JSON.stringify(
      json(admin.rest.resources.Product.all({ session, limit: 10 })),
    ),
  );
  const response = await admin.graphql(
    `#graphql
    query getMetaobjectDefinitionByType($type: String!) {
       metaobjectDefinitionByType(type: $type) {
        id
        type
        displayNameKey
        fieldDefinitions {
          name
          key
        }
      }
    }`,
    {
      variables: {
        type: "vendors",
      },
    },
  );
  const responseJson = await response.json();
  //  console.log(JSON.stringify(responseJson.data));

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};

export default function AppOnboarding() {
  /*const [collapsibleStates, setCollapsibleStates] = useState({
    1: true,
    2: false,
    3: false,
  });

  const handleCollapsibleToggle = (id) => {
    setCollapsibleStates((prevStates) => ({
      ...prevStates,
      [id]: !prevStates[id],
    }));
  };*/
  const nav = useNavigation();
  const { state, dispatch } = useSettings();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const actionData = useActionData();
  const submit = useSubmit();
  const generateMetafields = () =>
    submit(
      {
        state: JSON.stringify(state),
      },
      { replace: true, method: "POST" },
    );

  useEffect(() => {
    console.log(actionData);
    if (!actionData) return;
  }, [actionData, state]);

  return (
    <Page
      title="Settings"
      breadcrumbs={[{ content: "Back to Dashboard", url: "/dashboard" }]}
      primaryAction={{ content: "Save", disabled: false }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Account Connection"
          description="Connect your account to external services."
        >
          <AccountConnection
            connected
            accountName="Jane Doe"
            title="Facebook"
            action={{
              content: "Disconnect",
              onAction: void 0,
            }}
            details="No account connected"
          />
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="General Settings"
          description="Configure the general settings for your application."
        >
          <Card sectioned>
            <FormLayout>
              <TextField label="Store name" value={void 0} onChange={void 0} />
              <Checkbox
                label="Enable feature X"
                checked={void 0}
                onChange={void 0}
              />
              <ChoiceList
                title="Order processing"
                choices={[
                  { label: "Automatic", value: "automatic" },
                  { label: "Manual", value: "manual" },
                ]}
                selected={["automatic"]}
                onChange={void 0}
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Notifications"
          description="Manage your notification settings."
        >
          <SettingToggle
            action={{
              content: "enable",
              onAction: void 0,
            }}
            enabled={true}
          >
            {true
              ? "Notifications are enabled."
              : "Notifications are disabled."}
          </SettingToggle>
        </Layout.AnnotatedSection>

        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save",
              onAction: void 0,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: void 0,
              },
            ]}
          />
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
