import {
  Box, Button,
  Card, Collapsible, EmptyState, HorizontalGrid, HorizontalStack, Icon, IndexTable,
  Layout,
  List,
  Page, ProgressBar,
  Text, Thumbnail,
  VerticalStack,
} from "@shopify/polaris";
import {ChevronDownMinor, ChevronUpMinor, CircleDotsMajor} from "@shopify/polaris-icons";
import React, {useEffect, useState} from "react";
import {useSettings} from "~/context/AppSettings";
import {authenticate} from "~/shopify.server";
import {json} from "@remix-run/node";
import {Link, useActionData, useLoaderData, useNavigate, useNavigation, useSubmit} from "@remix-run/react";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";
export async function action({ request }) {
  const { admin, session,  sessionToken } = await authenticate.admin(request);

  const formData = await request.formData();
  const state = JSON.parse(formData.get("state"));
  //const responseJson = await response.json();

  //return json(responseJson.data);
}


export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

    const QUERY = `
    {
      metaobjects(type: "vendors", first: 1) {
        nodes {
          handle
          type
          id
          updatedAt
          capabilities {
            publishable {
              status
            }
          }
          description: field(key: "description") {
            value
          }
          created_at: field(key: "created_at") {
            value
          }
          line_items: field(key: "line_items") {
            value
          }
          status: field(key: "status") {
            value
          }
          show_name: field(key: "show_name") {
            value
          }
        }
      }
    }
  `;

  const variables = {
    first: 1,  // You can customize this or make it dynamic
    after: "" // This can be made dynamic based on pagination or cursor
  };

  const response = await admin.graphql(QUERY);
  const responseJson = await response.json();

  //create new object with only the fields we need
    const vendors = responseJson.data?.metaobjects?.nodes.map((vendor) => {
        return {
            id: vendor.id,
            handle: vendor.handle,
            description: vendor.description?.value,
            updatedAt: vendor.updatedAt,
            line_items: vendor.line_items?.value,
            status: vendor.capabilities?.publishable?.status,
            show_name: vendor.show_name?.value,
        };
    })

  return {
    sellers: vendors || [],
  };
}


const EmptysellerState = ({ onAction }) => (
  <EmptyState
    heading="Create unique QR codes for your product"
    action={{
      content: "Create QR code",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Allow customers to scan codes and buy products using their phones.</p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const SellerTable = ({ sellers }) => (
  <IndexTable
    resourceName={{
      singular: "Seller",
      plural: "Sellers",
    }}
    itemCount={sellers.length}
    headings={[
      { title: "Thumbnail", hidden: true },
      { title: "Title" },
      { title: "Product" },
      { title: "Last update" },
      { title: "Status" },
    ]}
    selectable={false}
  >
    {sellers.map((seller) => (
      <SellerTableRow key={seller.id} seller={seller} />
    ))}
  </IndexTable>
);

const SellerTableRow = ({ seller }) => {
    const regex = /(\d+)$/;
    let sellerIdOnly = seller?.id?.match(regex);

    if (sellerIdOnly) {
        sellerIdOnly = sellerIdOnly[1];
    }
    return (
        <IndexTable.Row id={sellerIdOnly} position={sellerIdOnly}>
            <IndexTable.Cell>
                {/*<Thumbnail*/}
                {/*  source={seller.productImage || ImageMajor}*/}
                {/*  alt={seller.productTitle}*/}
                {/*  size="small"*/}
                {/*/>*/}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Link to={`/app/seller/${sellerIdOnly}`}>{truncate(seller.handle)}</Link>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {seller.productDeleted ? (
                    <HorizontalStack align="start" gap="2">
          <span style={{ width: "20px" }}>
            <Icon source={DiamondAlertMajor} color="critical" />
          </span>
                        <Text color="critical" as="span">
                            product has been deleted
                        </Text>
                    </HorizontalStack>
                ) : (
                    truncate(seller.productTitle)
                )}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {new Date(seller.updatedAt).toDateString()}
            </IndexTable.Cell>
            <IndexTable.Cell>{seller.status}</IndexTable.Cell>
        </IndexTable.Row>
    )
}

export default function Index() {
  const { sellers } = useLoaderData();

  const navigate = useNavigate();

  return (
      <Page
          divider
          title="Sellers"
          primaryAction={{ content: "Create new seller" }}
          secondaryActions={[
              {
                  content: "Approve Seller",
                  disabled: true,
                  accessibilityLabel: "Secondary action label",
                  onAction: () => alert("Duplicate action"),
              },
          ]}
      >
      <Layout>
        <Layout.Section>
          <Card padding="0">
              {JSON.stringify(sellers)}
            {sellers.length === 0 ? (
              <EmptysellerState onAction={() => navigate("sellers/new")} />
            ) : (

               <SellerTable sellers={sellers} />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
