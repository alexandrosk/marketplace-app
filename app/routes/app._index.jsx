import React, { useCallback, useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Badge,
  Box,
  Button,
  Card,
  FooterHelp,
  InlineGrid,
  InlineStack,
  Layout,
  Link,
  MediaCard,
  Page,
  ProgressBar,
  Text,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { useSettings } from "~/context/AppSettings";
import { settingsHook } from "~/hooks/useSettings";
import { CREATE_METAOBJECT_VENDOR } from "~/graphql/mutations/createMetaobjectVendor";
import { CREATE_METAFIELD_DEFINITION } from "~/graphql/mutations/createMetafield";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const getCustomerAccountVersion = await admin.graphql(`
  #graphql
  {
    shop {
      name
      customerAccountsV2{
        customerAccountsVersion
      }
    }
  }`);
  const responseJson = await getCustomerAccountVersion.json();

  return json({
    shop: session.shop.replace(".myshopify.com", ""),
    customerAccountsVersion:
      responseJson.data.shop.customerAccountsV2.customerAccountsVersion,
  });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const createMetaobjectVendor = await admin.graphql(CREATE_METAOBJECT_VENDOR, {
    variables: {
      definition: {
        access: {
          /*"admin": "MERCHANT_READ_WRITE",*/
          storefront: "PUBLIC_READ",
        },
        capabilities: {
          publishable: {
            enabled: true,
          },
          // "renderable": {
          //   "enabled": true,
          //   "data": {
          //     "metaTitleKey": "title",
          //     "metaDescriptionKey": "description"
          //   }
          // }
        },
        name: "Vendor",
        type: "vendors",
        displayNameKey: "title",
        fieldDefinitions: [
          {
            name: "Title",
            key: "title",
            type: "single_line_text_field",
          },
          {
            name: "Description",
            key: "description",
            type: "multi_line_text_field",
          },
          {
            name: "status",
            key: "status",
            type: "list.single_line_text_field",
            description: "Vendors Status - Approved or not",
            required: false,
            validations: [
              {
                name: "choices",
                value: '["Approved","Pending","Declined"]',
              },
            ],
          },
          {
            name: "general",
            key: "general",
            type: "json",
            description: "General JSON information",
            required: false,
            validations: [],
          },
          { name: "slug", key: "slug", type: "single_line_text_field" },
          { name: "enabled", key: "enabled", type: "boolean" },
          {
            name: "rating",
            key: "rating",
            type: "rating",
            validations: [
              {
                name: "scale_min",
                value: "0",
              },
              {
                name: "scale_max",
                value: "5",
              },
            ],
          },
          {
            name: "rating_total",
            key: "rating_total",
            type: "number_integer",
          },
          { name: "social", key: "social", type: "json" },
          { name: "image", key: "image", type: "file_reference" },
          { name: "color", key: "background", type: "color" },
          { name: "address", key: "address", type: "single_line_text_field" },
          { name: "country", key: "country", type: "single_line_text_field" },
          {
            name: "payment_details",
            key: "payment_details",
            type: "multi_line_text_field",
          },
          {
            name: "paypal_email",
            key: "paypal_email",
            type: "single_line_text_field",
          },
          {
            name: "product_list",
            key: "product_list",
            type: "collection_reference",
          },
        ],
      },
    },
  });
  const responseJson = await createMetaobjectVendor.json();

  //if(responseJson.data.metaobjectDefinitionCreate.userErrors.length < 1){
  const productVendorReference = await admin.graphql(
    CREATE_METAFIELD_DEFINITION,
    {
      variables: {
        definition: {
          name: "Vendor",
          namespace: "vendor",
          key: "vendor_id",
          description: "Vendor of the product",
          type: "metaobject_reference",
          pin: true,
          ownerType: "PRODUCT",
          validations: [
            {
              name: "metaobject_definition_id",
              value:
                responseJson?.data?.metaobjectDefinitionCreate
                  ?.metaobjectDefinition?.id ?? "",
            },
          ],
        },
      },
    },
  );

  const CustomerVendorReference = await admin.graphql(
    CREATE_METAFIELD_DEFINITION,
    {
      variables: {
        definition: {
          name: "CustomerId",
          namespace: "vendor",
          key: "customer_id",
          useAsCollectionCondition: true,
          description:
            "Customer ID to connect product with customer and use for auto categorisation, this can't change",
          type: "single_line_text_field",
          pin: true,
          ownerType: "PRODUCT",
        },
      },
    },
  );

  const OrderVendorReference = await admin.graphql(
    CREATE_METAFIELD_DEFINITION,
    {
      variables: {
        definition: {
          name: "Vendor",
          namespace: "vendor",
          key: "vendor_ids",
          description: "Connected vendors",
          type: "list.metaobject_reference",
          pin: true,
          ownerType: "ORDER",
          validations: [
            {
              name: "metaobject_definition_id",
              value:
                responseJson?.data?.metaobjectDefinitionCreate
                  ?.metaobjectDefinition?.id ?? "",
            },
          ],
        },
      },
    },
  );

  const CollectionVendorReference = await admin.graphql(
    CREATE_METAFIELD_DEFINITION,
    {
      variables: {
        definition: {
          name: "Vendor",
          namespace: "vendor",
          key: "vendor_id",
          description: "Connected Vendor",
          type: "metaobject_reference",
          pin: true,
          ownerType: "COLLECTION",
          validations: [
            {
              name: "metaobject_definition_id",
              value:
                responseJson?.data?.metaobjectDefinitionCreate
                  ?.metaobjectDefinition?.id ?? "",
            },
          ],
        },
      },
    },
  );

  const CustomerVendorRerefence = await admin.graphql(
    CREATE_METAFIELD_DEFINITION,
    {
      variables: {
        definition: {
          name: "Vendor",
          namespace: "custom",
          key: "vendor_id",
          description: "Connected vendor",
          type: "metaobject_reference",
          pin: true,
          ownerType: "CUSTOMER",
          validations: [
            {
              name: "metaobject_definition_id",
              value:
                responseJson?.data?.metaobjectDefinitionCreate
                  ?.metaobjectDefinition?.id ?? "",
            },
          ],
        },
      },
    },
  );

  const otherResponses = await Promise.all([
    productVendorReference.json(),
    CustomerVendorReference.json(),
    OrderVendorReference.json(),
    CollectionVendorReference.json(),
    CustomerVendorRerefence.json(),
  ]);

  console.log(...otherResponses);

  //**Debug*

  // console.log(JSON.stringify(CustomerVendorRerefence.json()));

  return json(responseJson.data);
}

export default function Index() {
  const nav = useNavigation();
  const { shop, customerAccountsVersion } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const { state, dispatch } = useSettings();
  const { updateSetting } = settingsHook();
  const generateMetaobject = () =>
    submit({}, { replace: true, method: "POST" });

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  useEffect(() => {
    if (actionData?.metaobjectDefinitionCreate?.userErrors.length > 0) {
      shopify.toast.show(
        "Error creating metaobjects" +
          JSON.stringify(actionData?.metaobjectDefinitionCreate?.userErrors),
      );
    } else if (actionData?.metaobjectDefinitionCreate?.userErrors.length < 1) {
      shopify.toast.show("Metaobject created!");
      dispatch({
        type: "SET_SETTING",
        resourceId: "onboarding_step",
        value: 1,
      });
    }
  }, [actionData]);

  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  function setupAppExtension() {
    dispatch({
      type: "SET_SETTING",
      resourceId: "onboarding_step",
      value: 2,
    });
    window.open(
      "https://" +
        state.settings.shop +
        "/admin/themes/current/editor?template=customers/account&addAppBlockId=26d894f7-5584-457a-8a1a-3e08d03fcbd7/account-page&target=mainSection",
    );
  }
  const openSettings = () => {
    updateSetting(state.settings.shop, "onboarding_step", 3).then(() => {
      dispatch({
        type: "SET_SETTING",
        resourceId: "onboarding_step",
        value: "3",
      });
      window.open(
        "https://" +
          state.settings.shop +
          "/admin/apps/multivendor-shop/app/settings",
      );
    });
  };
  return (
    <Page title={"Multivendor Shop"}>
      <InlineGrid gap="300">
        <Layout>
          <Layout.Section>
            <Card>
              <InlineGrid gap="200">
                <InlineGrid gap="200">
                  <Text as="h1" variant="headingLg">
                    Welcome to Multivendor Shop 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Please follow the steps below to get started. <br></br>
                    Once you finish the required steps this page will be changed
                    and show the app dashboard.
                  </Text>
                </InlineGrid>
                {actionData && (
                  <Box
                    padding="400"
                    background="bg-subdued"
                    borderColor="border"
                    borderWidth="1"
                    borderRadius="2"
                    overflowX="scroll"
                  >
                    {(actionData.metaobjectDefinitionCreate.userErrors.length <
                      1 && (
                      <Text variant="bodyMd" as="p">
                        Metaobjects created successfully
                      </Text>
                    )) || (
                      <Text variant="bodyMd" as="p">
                        Error creating metaobjects
                        {JSON.stringify(
                          actionData.metaobjectDefinitionCreate.userErrors,
                        )}
                      </Text>
                    )}
                  </Box>
                )}
              </InlineGrid>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <InlineGrid gap="5">
                <InlineGrid gap="2">
                  <Text as="h2" variant="headingMd">
                    Setup Guide
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Please follow the steps below to get started. <br />
                  </Text>
                </InlineGrid>
                <InlineGrid blockAlign="baseline">
                  <div
                    style={{
                      width: "20%",
                    }}
                  >
                    <Text as="p" color="subdued">
                      {state.settings.onboarding_step ?? 0} of 3 tasks completed
                    </Text>
                  </div>
                  <div
                    className={"my-2"}
                    style={{
                      width: "100%",
                    }}
                  >
                    {/*@todo Demo: of course we can't check this with  0-3, except we disable previous steps */}
                    <ProgressBar
                      progress={
                        state.settings.onboarding_step === 0
                          ? 0
                          : state.settings.onboarding_step === 1
                            ? 33
                            : state.settings.onboarding_step === 2
                              ? 66
                              : 100
                      }
                      size="small"
                    />
                  </div>
                </InlineGrid>
                <br />
                <InlineGrid gap={"400"}>
                  {state.settings.onboarding_step === 0 && (
                    <div>
                      <Card>
                        <InlineStack>
                          <div style={{ width: "2rem" }}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="_hUo3"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M21.9147 13.3062L19.9315 13.0475C19.9761 12.7056 19.9993 12.3561 19.9993 12.0001C19.9993 11.6442 19.9761 11.2946 19.9315 10.9527L21.9147 10.694C21.9705 11.1215 21.9993 11.5575 21.9993 12.0001C21.9993 12.4428 21.9705 12.8787 21.9147 13.3062ZM21.2405 8.17224L19.393 8.93835C19.1238 8.28906 18.7709 7.68206 18.3474 7.13093L19.9333 5.91228C20.4621 6.6004 20.9033 7.35927 21.2405 8.17224ZM18.0871 4.06613L16.8685 5.65197C16.3173 5.22845 15.7103 4.87563 15.061 4.60638L15.8271 2.75893C16.6401 3.09605 17.399 3.53734 18.0871 4.06613ZM13.3054 2.08464L13.0467 4.06784C12.7048 4.02324 12.3552 4.00012 11.9993 4.00012C11.6433 4.00012 11.2938 4.02324 10.9519 4.06784L10.6932 2.08464C11.1206 2.02889 11.5566 2.00012 11.9993 2.00012C12.4419 2.00012 12.8779 2.02889 13.3054 2.08464ZM8.17139 2.75893L8.9375 4.60638C8.2882 4.87563 7.6812 5.22845 7.13008 5.65197L5.91143 4.06613C6.59954 3.53734 7.35841 3.09606 8.17139 2.75893ZM4.06527 5.91228L5.65111 7.13093C5.22759 7.68206 4.87478 8.28906 4.60552 8.93835L2.75807 8.17225C3.0952 7.35927 3.53648 6.6004 4.06527 5.91228ZM2.08379 10.694C2.02803 11.1215 1.99927 11.5575 1.99927 12.0001C1.99927 12.4428 2.02803 12.8787 2.08379 13.3062L4.06699 13.0475C4.02239 12.7056 3.99927 12.3561 3.99927 12.0001C3.99927 11.6442 4.02239 11.2946 4.06699 10.9527L2.08379 10.694ZM2.75807 15.828L4.60553 15.0619C4.87478 15.7112 5.22759 16.3182 5.65111 16.8693L4.06527 18.088C3.53648 17.3998 3.0952 16.641 2.75807 15.828ZM5.91143 19.9341L7.13008 18.3483C7.68121 18.7718 8.28821 19.1246 8.9375 19.3939L8.17139 21.2413C7.35841 20.9042 6.59955 20.4629 5.91143 19.9341ZM10.6932 21.9156L10.9519 19.9324C11.2938 19.977 11.6433 20.0001 11.9993 20.0001C12.3552 20.0001 12.7048 19.977 13.0467 19.9324L13.3054 21.9156C12.8779 21.9714 12.4419 22.0001 11.9993 22.0001C11.5566 22.0001 11.1206 21.9714 10.6932 21.9156ZM15.8271 21.2413L15.061 19.3939C15.7103 19.1246 16.3173 18.7718 16.8685 18.3483L18.0871 19.9341C17.399 20.4629 16.6401 20.9042 15.8271 21.2413ZM19.9333 18.088L18.3474 16.8693C18.7709 16.3182 19.1238 15.7112 19.393 15.0619L21.2405 15.828C20.9033 16.641 20.4621 17.3998 19.9333 18.088Z"
                                fill="#8C9196"
                                className="Pklnb WzwlI"
                              ></path>
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.5334 2.10692C11.0126 2.03643 11.5024 2 12 2C12.4976 2 12.9874 2.03643 13.4666 2.10692C14.013 2.18729 14.3908 2.6954 14.3104 3.2418C14.23 3.78821 13.7219 4.166 13.1755 4.08563C12.7924 4.02927 12.3999 4 12 4C11.6001 4 11.2076 4.02927 10.8245 4.08563C10.2781 4.166 9.76995 3.78821 9.68958 3.2418C9.6092 2.6954 9.987 2.18729 10.5334 2.10692ZM7.44122 4.17428C7.77056 4.61763 7.67814 5.24401 7.23479 5.57335C6.603 6.04267 6.04267 6.603 5.57335 7.23479C5.24401 7.67814 4.61763 7.77056 4.17428 7.44122C3.73094 7.11188 3.63852 6.4855 3.96785 6.04216C4.55386 5.25329 5.25329 4.55386 6.04216 3.96785C6.4855 3.63852 7.11188 3.73094 7.44122 4.17428ZM16.5588 4.17428C16.8881 3.73094 17.5145 3.63852 17.9578 3.96785C18.7467 4.55386 19.4461 5.25329 20.0321 6.04216C20.3615 6.4855 20.2691 7.11188 19.8257 7.44122C19.3824 7.77056 18.756 7.67814 18.4267 7.23479C17.9573 6.603 17.397 6.04267 16.7652 5.57335C16.3219 5.24401 16.2294 4.61763 16.5588 4.17428ZM3.2418 9.68958C3.78821 9.76995 4.166 10.2781 4.08563 10.8245C4.02927 11.2076 4 11.6001 4 12C4 12.3999 4.02927 12.7924 4.08563 13.1755C4.166 13.7219 3.78821 14.23 3.2418 14.3104C2.6954 14.3908 2.18729 14.013 2.10692 13.4666C2.03643 12.9874 2 12.4976 2 12C2 11.5024 2.03643 11.0126 2.10692 10.5334C2.18729 9.987 2.6954 9.6092 3.2418 9.68958ZM20.7582 9.68958C21.3046 9.6092 21.8127 9.987 21.8931 10.5334C21.9636 11.0126 22 11.5024 22 12C22 12.4976 21.9636 12.9874 21.8931 13.4666C21.8127 14.013 21.3046 14.3908 20.7582 14.3104C20.2118 14.23 19.834 13.7219 19.9144 13.1755C19.9707 12.7924 20 12.3999 20 12C20 11.6001 19.9707 11.2076 19.9144 10.8245C19.834 10.2781 20.2118 9.76995 20.7582 9.68958ZM4.17428 16.5588C4.61763 16.2294 5.24401 16.3219 5.57335 16.7652C6.04267 17.397 6.603 17.9573 7.23479 18.4267C7.67814 18.756 7.77056 19.3824 7.44122 19.8257C7.11188 20.2691 6.4855 20.3615 6.04216 20.0321C5.25329 19.4461 4.55386 18.7467 3.96785 17.9578C3.63852 17.5145 3.73094 16.8881 4.17428 16.5588ZM19.8257 16.5588C20.2691 16.8881 20.3615 17.5145 20.0321 17.9578C19.4461 18.7467 18.7467 19.4461 17.9578 20.0321C17.5145 20.3615 16.8881 20.2691 16.5588 19.8257C16.2294 19.3824 16.3219 18.756 16.7652 18.4267C17.397 17.9573 17.9573 17.397 18.4267 16.7652C18.756 16.3219 19.3824 16.2294 19.8257 16.5588ZM9.68958 20.7582C9.76995 20.2118 10.2781 19.834 10.8245 19.9144C11.2076 19.9707 11.6001 20 12 20C12.3999 20 12.7924 19.9707 13.1755 19.9144C13.7219 19.834 14.23 20.2118 14.3104 20.7582C14.3908 21.3046 14.013 21.8127 13.4666 21.8931C12.9874 21.9636 12.4976 22 12 22C11.5024 22 11.0126 21.9636 10.5334 21.8931C9.987 21.8127 9.6092 21.3046 9.68958 20.7582Z"
                                fill="#8A8A8A"
                                className="CLJ7G WzwlI"
                              ></path>
                              <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="#DBDDDF"
                                className="Pklnb hKH6r"
                              ></circle>
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="#F6F6F7"
                                stroke="#999EA4"
                                strokeWidth="2"
                                className="hKH6r"
                              ></circle>
                            </svg>
                          </div>
                          <div style={{ maxWidth: "40rem" }}>
                            <Text as="h2" variant="headingMd">
                              1. Setup Your Metaobjects <Badge>Required</Badge>
                            </Text>
                            <br />
                            <Text as="h2" variant="headingMd">
                              <p>
                                We need to setup the Vendor metaobject and the
                                Vendor metafields on Orders, Customers Products
                                and Collections. <br />
                                You can easily remove this from the app settings
                                later if you want to.
                              </p>
                            </Text>
                            <br />
                            <Button
                              onClick={generateMetaobject}
                              loading={isLoading}
                              primary
                              ariaControls="basic-collapsible"
                            >
                              Start here!
                            </Button>
                          </div>
                          <div
                            style={{
                              maxWidth: "12rem",
                              maxHeight: "9.5rem",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              style={{ maxWidth: "220px" }}
                              src={"/images/app/part1.png"}
                              alt={""}
                            />
                          </div>
                        </InlineStack>
                      </Card>
                    </div>
                  )}
                  {state.settings.onboarding_step < 2 && (
                    <div
                      className={
                        state.settings.onboarding_step !== 1
                          ? "disabled-div"
                          : ""
                      }
                    >
                      <Card>
                        <InlineStack>
                          <div style={{ width: "2rem" }}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="_hUo3"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M21.9147 13.3062L19.9315 13.0475C19.9761 12.7056 19.9993 12.3561 19.9993 12.0001C19.9993 11.6442 19.9761 11.2946 19.9315 10.9527L21.9147 10.694C21.9705 11.1215 21.9993 11.5575 21.9993 12.0001C21.9993 12.4428 21.9705 12.8787 21.9147 13.3062ZM21.2405 8.17224L19.393 8.93835C19.1238 8.28906 18.7709 7.68206 18.3474 7.13093L19.9333 5.91228C20.4621 6.6004 20.9033 7.35927 21.2405 8.17224ZM18.0871 4.06613L16.8685 5.65197C16.3173 5.22845 15.7103 4.87563 15.061 4.60638L15.8271 2.75893C16.6401 3.09605 17.399 3.53734 18.0871 4.06613ZM13.3054 2.08464L13.0467 4.06784C12.7048 4.02324 12.3552 4.00012 11.9993 4.00012C11.6433 4.00012 11.2938 4.02324 10.9519 4.06784L10.6932 2.08464C11.1206 2.02889 11.5566 2.00012 11.9993 2.00012C12.4419 2.00012 12.8779 2.02889 13.3054 2.08464ZM8.17139 2.75893L8.9375 4.60638C8.2882 4.87563 7.6812 5.22845 7.13008 5.65197L5.91143 4.06613C6.59954 3.53734 7.35841 3.09606 8.17139 2.75893ZM4.06527 5.91228L5.65111 7.13093C5.22759 7.68206 4.87478 8.28906 4.60552 8.93835L2.75807 8.17225C3.0952 7.35927 3.53648 6.6004 4.06527 5.91228ZM2.08379 10.694C2.02803 11.1215 1.99927 11.5575 1.99927 12.0001C1.99927 12.4428 2.02803 12.8787 2.08379 13.3062L4.06699 13.0475C4.02239 12.7056 3.99927 12.3561 3.99927 12.0001C3.99927 11.6442 4.02239 11.2946 4.06699 10.9527L2.08379 10.694ZM2.75807 15.828L4.60553 15.0619C4.87478 15.7112 5.22759 16.3182 5.65111 16.8693L4.06527 18.088C3.53648 17.3998 3.0952 16.641 2.75807 15.828ZM5.91143 19.9341L7.13008 18.3483C7.68121 18.7718 8.28821 19.1246 8.9375 19.3939L8.17139 21.2413C7.35841 20.9042 6.59955 20.4629 5.91143 19.9341ZM10.6932 21.9156L10.9519 19.9324C11.2938 19.977 11.6433 20.0001 11.9993 20.0001C12.3552 20.0001 12.7048 19.977 13.0467 19.9324L13.3054 21.9156C12.8779 21.9714 12.4419 22.0001 11.9993 22.0001C11.5566 22.0001 11.1206 21.9714 10.6932 21.9156ZM15.8271 21.2413L15.061 19.3939C15.7103 19.1246 16.3173 18.7718 16.8685 18.3483L18.0871 19.9341C17.399 20.4629 16.6401 20.9042 15.8271 21.2413ZM19.9333 18.088L18.3474 16.8693C18.7709 16.3182 19.1238 15.7112 19.393 15.0619L21.2405 15.828C20.9033 16.641 20.4621 17.3998 19.9333 18.088Z"
                                fill="#8C9196"
                                className="Pklnb WzwlI"
                              ></path>
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.5334 2.10692C11.0126 2.03643 11.5024 2 12 2C12.4976 2 12.9874 2.03643 13.4666 2.10692C14.013 2.18729 14.3908 2.6954 14.3104 3.2418C14.23 3.78821 13.7219 4.166 13.1755 4.08563C12.7924 4.02927 12.3999 4 12 4C11.6001 4 11.2076 4.02927 10.8245 4.08563C10.2781 4.166 9.76995 3.78821 9.68958 3.2418C9.6092 2.6954 9.987 2.18729 10.5334 2.10692ZM7.44122 4.17428C7.77056 4.61763 7.67814 5.24401 7.23479 5.57335C6.603 6.04267 6.04267 6.603 5.57335 7.23479C5.24401 7.67814 4.61763 7.77056 4.17428 7.44122C3.73094 7.11188 3.63852 6.4855 3.96785 6.04216C4.55386 5.25329 5.25329 4.55386 6.04216 3.96785C6.4855 3.63852 7.11188 3.73094 7.44122 4.17428ZM16.5588 4.17428C16.8881 3.73094 17.5145 3.63852 17.9578 3.96785C18.7467 4.55386 19.4461 5.25329 20.0321 6.04216C20.3615 6.4855 20.2691 7.11188 19.8257 7.44122C19.3824 7.77056 18.756 7.67814 18.4267 7.23479C17.9573 6.603 17.397 6.04267 16.7652 5.57335C16.3219 5.24401 16.2294 4.61763 16.5588 4.17428ZM3.2418 9.68958C3.78821 9.76995 4.166 10.2781 4.08563 10.8245C4.02927 11.2076 4 11.6001 4 12C4 12.3999 4.02927 12.7924 4.08563 13.1755C4.166 13.7219 3.78821 14.23 3.2418 14.3104C2.6954 14.3908 2.18729 14.013 2.10692 13.4666C2.03643 12.9874 2 12.4976 2 12C2 11.5024 2.03643 11.0126 2.10692 10.5334C2.18729 9.987 2.6954 9.6092 3.2418 9.68958ZM20.7582 9.68958C21.3046 9.6092 21.8127 9.987 21.8931 10.5334C21.9636 11.0126 22 11.5024 22 12C22 12.4976 21.9636 12.9874 21.8931 13.4666C21.8127 14.013 21.3046 14.3908 20.7582 14.3104C20.2118 14.23 19.834 13.7219 19.9144 13.1755C19.9707 12.7924 20 12.3999 20 12C20 11.6001 19.9707 11.2076 19.9144 10.8245C19.834 10.2781 20.2118 9.76995 20.7582 9.68958ZM4.17428 16.5588C4.61763 16.2294 5.24401 16.3219 5.57335 16.7652C6.04267 17.397 6.603 17.9573 7.23479 18.4267C7.67814 18.756 7.77056 19.3824 7.44122 19.8257C7.11188 20.2691 6.4855 20.3615 6.04216 20.0321C5.25329 19.4461 4.55386 18.7467 3.96785 17.9578C3.63852 17.5145 3.73094 16.8881 4.17428 16.5588ZM19.8257 16.5588C20.2691 16.8881 20.3615 17.5145 20.0321 17.9578C19.4461 18.7467 18.7467 19.4461 17.9578 20.0321C17.5145 20.3615 16.8881 20.2691 16.5588 19.8257C16.2294 19.3824 16.3219 18.756 16.7652 18.4267C17.397 17.9573 17.9573 17.397 18.4267 16.7652C18.756 16.3219 19.3824 16.2294 19.8257 16.5588ZM9.68958 20.7582C9.76995 20.2118 10.2781 19.834 10.8245 19.9144C11.2076 19.9707 11.6001 20 12 20C12.3999 20 12.7924 19.9707 13.1755 19.9144C13.7219 19.834 14.23 20.2118 14.3104 20.7582C14.3908 21.3046 14.013 21.8127 13.4666 21.8931C12.9874 21.9636 12.4976 22 12 22C11.5024 22 11.0126 21.9636 10.5334 21.8931C9.987 21.8127 9.6092 21.3046 9.68958 20.7582Z"
                                fill="#8A8A8A"
                                className="CLJ7G WzwlI"
                              ></path>
                              <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="#DBDDDF"
                                className="Pklnb hKH6r"
                              ></circle>
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="#F6F6F7"
                                stroke="#999EA4"
                                strokeWidth="2"
                                className="hKH6r"
                              ></circle>
                            </svg>
                          </div>
                          <div style={{ maxWidth: "40rem" }}>
                            <Text as="h2" variant="headingMd">
                              2. Setup App extension
                            </Text>
                            <br />
                            <Text as="h2" variant="headingMd">
                              <p>
                                Add our app extension in your customers account
                                page or on any other page you'd like to.
                              </p>
                              <p>
                                <strong>Important:</strong>
                                <ul>
                                  <li>
                                    1. From your Store go to: Settings -
                                    Customer Accounts
                                  </li>
                                  <li>
                                    2. Enable `Show login link in the header of
                                    online store and at checkout`{" "}
                                  </li>
                                  <li>3. Select `Classic customer accounts`</li>
                                  <li>
                                    4. Go to Online Store - Themes - Customize -
                                    Add section
                                  </li>
                                </ul>
                                <br />
                                <br />
                                Customer must be logged in to use the vendor
                                dashboard - application.
                              </p>
                              <Link
                                url="https://www.multivendorshop.com/docs/admin/theme"
                                target={"_blank"}
                              >
                                Theme App Documentation
                              </Link>
                              {customerAccountsVersion !== "CLASSIC" && (
                                <Text as="h2" variant="headingMd">
                                  SEEMS LIKE YOU'RE USING CUSTOMER ACCOUNTS V2{" "}
                                  <br />
                                  Vendors extension is not available for this
                                  version yet. <br />
                                  Either change back to classic or wait for the
                                  next release.
                                </Text>
                              )}
                            </Text>
                            <br />
                            {state.settings.onboarding_step == 1 && (
                              <Button
                                onClick={setupAppExtension}
                                ariaExpanded={open}
                                ariaControls="basic-collapsible"
                              >
                                Add App extension
                              </Button>
                            )}
                          </div>
                          <div
                            style={{
                              maxWidth: "10rem",
                              maxHeight: "9.5rem",
                              position: "relative",
                              right: "-4rem",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              style={{ maxWidth: "220px" }}
                              src={"/images/app/design.png"}
                              alt={""}
                            />
                          </div>
                        </InlineStack>
                      </Card>
                    </div>
                  )}
                  {state.settings.onboarding_step < 3 && (
                    <div
                      className={
                        state.settings.onboarding_step !== 1
                          ? "disabled-div"
                          : ""
                      }
                    >
                      <Card background={"bg-subdued"}>
                        <InlineStack>
                          <div style={{ width: "2rem" }}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="_hUo3"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M21.9147 13.3062L19.9315 13.0475C19.9761 12.7056 19.9993 12.3561 19.9993 12.0001C19.9993 11.6442 19.9761 11.2946 19.9315 10.9527L21.9147 10.694C21.9705 11.1215 21.9993 11.5575 21.9993 12.0001C21.9993 12.4428 21.9705 12.8787 21.9147 13.3062ZM21.2405 8.17224L19.393 8.93835C19.1238 8.28906 18.7709 7.68206 18.3474 7.13093L19.9333 5.91228C20.4621 6.6004 20.9033 7.35927 21.2405 8.17224ZM18.0871 4.06613L16.8685 5.65197C16.3173 5.22845 15.7103 4.87563 15.061 4.60638L15.8271 2.75893C16.6401 3.09605 17.399 3.53734 18.0871 4.06613ZM13.3054 2.08464L13.0467 4.06784C12.7048 4.02324 12.3552 4.00012 11.9993 4.00012C11.6433 4.00012 11.2938 4.02324 10.9519 4.06784L10.6932 2.08464C11.1206 2.02889 11.5566 2.00012 11.9993 2.00012C12.4419 2.00012 12.8779 2.02889 13.3054 2.08464ZM8.17139 2.75893L8.9375 4.60638C8.2882 4.87563 7.6812 5.22845 7.13008 5.65197L5.91143 4.06613C6.59954 3.53734 7.35841 3.09606 8.17139 2.75893ZM4.06527 5.91228L5.65111 7.13093C5.22759 7.68206 4.87478 8.28906 4.60552 8.93835L2.75807 8.17225C3.0952 7.35927 3.53648 6.6004 4.06527 5.91228ZM2.08379 10.694C2.02803 11.1215 1.99927 11.5575 1.99927 12.0001C1.99927 12.4428 2.02803 12.8787 2.08379 13.3062L4.06699 13.0475C4.02239 12.7056 3.99927 12.3561 3.99927 12.0001C3.99927 11.6442 4.02239 11.2946 4.06699 10.9527L2.08379 10.694ZM2.75807 15.828L4.60553 15.0619C4.87478 15.7112 5.22759 16.3182 5.65111 16.8693L4.06527 18.088C3.53648 17.3998 3.0952 16.641 2.75807 15.828ZM5.91143 19.9341L7.13008 18.3483C7.68121 18.7718 8.28821 19.1246 8.9375 19.3939L8.17139 21.2413C7.35841 20.9042 6.59955 20.4629 5.91143 19.9341ZM10.6932 21.9156L10.9519 19.9324C11.2938 19.977 11.6433 20.0001 11.9993 20.0001C12.3552 20.0001 12.7048 19.977 13.0467 19.9324L13.3054 21.9156C12.8779 21.9714 12.4419 22.0001 11.9993 22.0001C11.5566 22.0001 11.1206 21.9714 10.6932 21.9156ZM15.8271 21.2413L15.061 19.3939C15.7103 19.1246 16.3173 18.7718 16.8685 18.3483L18.0871 19.9341C17.399 20.4629 16.6401 20.9042 15.8271 21.2413ZM19.9333 18.088L18.3474 16.8693C18.7709 16.3182 19.1238 15.7112 19.393 15.0619L21.2405 15.828C20.9033 16.641 20.4621 17.3998 19.9333 18.088Z"
                                fill="#8C9196"
                                className="Pklnb WzwlI"
                              ></path>
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.5334 2.10692C11.0126 2.03643 11.5024 2 12 2C12.4976 2 12.9874 2.03643 13.4666 2.10692C14.013 2.18729 14.3908 2.6954 14.3104 3.2418C14.23 3.78821 13.7219 4.166 13.1755 4.08563C12.7924 4.02927 12.3999 4 12 4C11.6001 4 11.2076 4.02927 10.8245 4.08563C10.2781 4.166 9.76995 3.78821 9.68958 3.2418C9.6092 2.6954 9.987 2.18729 10.5334 2.10692ZM7.44122 4.17428C7.77056 4.61763 7.67814 5.24401 7.23479 5.57335C6.603 6.04267 6.04267 6.603 5.57335 7.23479C5.24401 7.67814 4.61763 7.77056 4.17428 7.44122C3.73094 7.11188 3.63852 6.4855 3.96785 6.04216C4.55386 5.25329 5.25329 4.55386 6.04216 3.96785C6.4855 3.63852 7.11188 3.73094 7.44122 4.17428ZM16.5588 4.17428C16.8881 3.73094 17.5145 3.63852 17.9578 3.96785C18.7467 4.55386 19.4461 5.25329 20.0321 6.04216C20.3615 6.4855 20.2691 7.11188 19.8257 7.44122C19.3824 7.77056 18.756 7.67814 18.4267 7.23479C17.9573 6.603 17.397 6.04267 16.7652 5.57335C16.3219 5.24401 16.2294 4.61763 16.5588 4.17428ZM3.2418 9.68958C3.78821 9.76995 4.166 10.2781 4.08563 10.8245C4.02927 11.2076 4 11.6001 4 12C4 12.3999 4.02927 12.7924 4.08563 13.1755C4.166 13.7219 3.78821 14.23 3.2418 14.3104C2.6954 14.3908 2.18729 14.013 2.10692 13.4666C2.03643 12.9874 2 12.4976 2 12C2 11.5024 2.03643 11.0126 2.10692 10.5334C2.18729 9.987 2.6954 9.6092 3.2418 9.68958ZM20.7582 9.68958C21.3046 9.6092 21.8127 9.987 21.8931 10.5334C21.9636 11.0126 22 11.5024 22 12C22 12.4976 21.9636 12.9874 21.8931 13.4666C21.8127 14.013 21.3046 14.3908 20.7582 14.3104C20.2118 14.23 19.834 13.7219 19.9144 13.1755C19.9707 12.7924 20 12.3999 20 12C20 11.6001 19.9707 11.2076 19.9144 10.8245C19.834 10.2781 20.2118 9.76995 20.7582 9.68958ZM4.17428 16.5588C4.61763 16.2294 5.24401 16.3219 5.57335 16.7652C6.04267 17.397 6.603 17.9573 7.23479 18.4267C7.67814 18.756 7.77056 19.3824 7.44122 19.8257C7.11188 20.2691 6.4855 20.3615 6.04216 20.0321C5.25329 19.4461 4.55386 18.7467 3.96785 17.9578C3.63852 17.5145 3.73094 16.8881 4.17428 16.5588ZM19.8257 16.5588C20.2691 16.8881 20.3615 17.5145 20.0321 17.9578C19.4461 18.7467 18.7467 19.4461 17.9578 20.0321C17.5145 20.3615 16.8881 20.2691 16.5588 19.8257C16.2294 19.3824 16.3219 18.756 16.7652 18.4267C17.397 17.9573 17.9573 17.397 18.4267 16.7652C18.756 16.3219 19.3824 16.2294 19.8257 16.5588ZM9.68958 20.7582C9.76995 20.2118 10.2781 19.834 10.8245 19.9144C11.2076 19.9707 11.6001 20 12 20C12.3999 20 12.7924 19.9707 13.1755 19.9144C13.7219 19.834 14.23 20.2118 14.3104 20.7582C14.3908 21.3046 14.013 21.8127 13.4666 21.8931C12.9874 21.9636 12.4976 22 12 22C11.5024 22 11.0126 21.9636 10.5334 21.8931C9.987 21.8127 9.6092 21.3046 9.68958 20.7582Z"
                                fill="#8A8A8A"
                                className="CLJ7G WzwlI"
                              ></path>
                              <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="#DBDDDF"
                                className="Pklnb hKH6r"
                              ></circle>
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="#F6F6F7"
                                stroke="#999EA4"
                                strokeWidth="2"
                                className="hKH6r"
                              ></circle>
                            </svg>
                          </div>
                          <div style={{ maxWidth: "40rem" }}>
                            <Text as="h2" variant="headingMd">
                              3. Settings
                            </Text>
                            <br />
                            <Text as="h2" variant="headingMd">
                              <p>
                                Setup the app settings to your liking. Configure
                                default commissions, auto approval, fields for
                                customers to fill in and more.
                              </p>
                              <Link
                                url="https://www.multivendorshop.com/docs/admin/settings"
                                target={"_blank"}
                              >
                                Settings Documentation
                              </Link>
                            </Text>
                            <br />
                            {state.settings.onboarding_step == 2 && (
                              <Button
                                onClick={openSettings}
                                ariaExpanded={open}
                                primary
                                ariaControls="basic-collapsible"
                              >
                                Settings setup
                              </Button>
                            )}
                          </div>
                          <div
                            style={{
                              maxWidth: "12rem",
                              maxHeight: "9.5rem",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              style={{ maxWidth: "220px" }}
                              src={"/images/app/settings.png"}
                              alt={""}
                            />
                          </div>
                        </InlineStack>
                      </Card>
                    </div>
                  )}
                </InlineGrid>

                {/*<HorizontalStack gap="3" align="end">
                  <Button
                      url={`https://admin.shopify.com/store/${shop}/admin/products/${productId}`}
                      target="_blank">
                    Go to settings
                  </Button>
                </HorizontalStack>*/}
              </InlineGrid>
            </Card>
            <br />
            {state.settings.onboarding_step >= 3 && (
              <Card>
                <InlineGrid>
                  <Text as="h2" variant="headingMd">
                    Dashboard
                  </Text>
                </InlineGrid>
              </Card>
            )}
          </Layout.Section>

          <Layout.Section>
            <br />
            <Text as="h1" variant="headingLg">
              App Guide &nbsp;
            </Text>
            <br />
            <MediaCard
              title="How to use the app"
              primaryAction={{
                content: "Read the docs",
                onAction: () => {},
              }}
              description="Add the app to your customer page to show the vendors.
                Or any other related page that you prefer for vendor to see their info and upload products."
              popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
            >
              <img
                alt=""
                width="100%"
                height="100%"
                style={{ objectFit: "cover", objectPosition: "center" }}
                src="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
              />
            </MediaCard>
          </Layout.Section>
        </Layout>
      </InlineGrid>
      <FooterHelp>
        Learn more about{" "}
        <Link url="https://help.shopify.com/manual/orders/fulfill-orders">
          fulfilling orders
        </Link>
      </FooterHelp>
    </Page>
  );
}
