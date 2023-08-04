import {
  Box, Button, CalloutCard,
  Card, HorizontalGrid, ProgressBar,
  Layout,
  Link,
  List,
  Page,
  Text, Thumbnail,
  VerticalStack, HorizontalStack, Collapsible, Icon,
} from "@shopify/polaris";
import {
  ChevronDownMinor,ChevronUpMinor,CircleDotsMajor} from '@shopify/polaris-icons';
import React, {useEffect, useState} from "react";
import OnboardingModal from "../components/OnboardingModal";
import {useActionData, useLoaderData, useNavigation, useSubmit} from "@remix-run/react";
import {authenticate, login} from "~/shopify.server";
import {json} from "@remix-run/node";
import {useMetafields} from "~/context/AppMetafields";
export async function action({ request }) {
  const { admin, session,  sessionToken } = await authenticate.admin(request);

  const formData = await request.formData();
  const state = JSON.parse(formData.get("state"));

  const response = await admin.graphql(
    `#graphql
    mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafieldsSetInput: [
          {
            namespace: "settings",
            key: "settings",
            value: JSON.stringify({"onboarding":true, "onboardingStep":1}),
            type: "json",
            ownerId: state?.appId,
          },
        ]
      }
    }
  );
  return json({'success': true});
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
}

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
  const {state, dispatch} = useMetafields();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const actionData = useActionData();
  const submit = useSubmit();
  const generateMetafields = () => submit({
    state: JSON.stringify(state),
  }, { replace: true, method: "POST" });

  useEffect(() => {
    dispatch({
      type: 'UPDATE_METAFIELD_VALUE',
      key: 'settings',
      property: 'onboarding',
      value: false //fix this with the return of the actionData
    });
  }, [actionData]);

  return (
    <Page>
      <ui-title-bar title="Generate metafields 🎉" >
        <button variant="primary" onClick={generateMetafields}>
          Tutorial
        </button>
      </ui-title-bar>

      <VerticalStack >
        <Card>
        {/*{actionData?.product && (
          <Button
            url={`https://admin.shopify.com/store/${shop}/admin/products/${productId}`}
            target="_blank"
          >
            View product
          </Button>
        )}*/}
          <Text as={"p"}>
            Welcome! 🎉 <br/>
            To start you need to click the button below to generate the metafields. <br/>
            <strong>First step is to create the metaobject "Seller" that will be your sellers from now on. <br/></strong>
            <br/>
            We will generate the Metaobject "Seller" that will be your sellers from now on. <br/>
            We need to also connect this with Products, Orders, Collections and Customers. <br/>
            Everything is shopify native and you can always remove that. <br/>
            Nothing will be added on the frontend of your site. <br/>
            <br/>
          </Text>
          <Thumbnail source="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg" alt="Empty state" />
        <Button loading={isLoading} primary onClick={generateMetafields}>
          Generate Metafields
        </Button>
        </Card>
      </VerticalStack>
      <OnboardingModal />
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
