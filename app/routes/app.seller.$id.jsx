import {
  Banner,
  Box,
  Card,
  InlineGrid,
  Link,
  Page,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";

import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

export async function loader({ params, request }) {
  const sellerId = params.id;
  const { admin, session } = await authenticate.admin(request);

  const QUERY = `
    {
       metaobject(id: "gid://shopify/Metaobject/${sellerId}") {
        id
        handle
          type
          id
          updatedAt
          capabilities {
            publishable {
              status
            }
          }
          image: field(key: "image") {
            reference {
                ... on MediaImage {
                    image {
                        originalSrc
                    }
                }
            }
           }
          description: field(key: "description") {
            value
          }
          title: field(key: "title") {
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
          commission: field(key: "commission") {
            value
          }
      }
    }
  `;

  const variables = {
    first: 1, // You can customize this or make it dynamic
    after: "", // This can be made dynamic based on pagination or cursor
  };

  const response = await admin.graphql(QUERY);
  const responseJson = await response.json();
  const vendor = responseJson.data?.metaobject || {};

  return {
    vendor: {
      id: vendor.id,
      paramsId: sellerId,
      handle: vendor.handle,
      description: vendor.description?.value,
      updatedAt: vendor.updatedAt,
      line_items: vendor.line_items?.value,
      status: vendor.capabilities?.publishable?.status,
      show_name: vendor.show_name?.value,
      title: vendor.title?.value,
      image: vendor.image?.reference?.image?.originalSrc,
      commission: vendor.commission?.value ?? "0",
    },
    shop: session.shop,
  };
}
export default function SellerPage() {
  const { vendor, shop } = useLoaderData();
  const storeName = shop?.split(".")[0];
  console.log(vendor);
  const SkeletonLabel = (props) => {
    return (
      <Box
        background="bg-strong"
        minHeight="1rem"
        maxWidth="5rem"
        borderRadius="base"
        {...props}
      />
    );
  };
  return (
    <Page
      backAction={{ content: "Vendors", url: "/app/sellers" }}
      title={vendor.handle}
      primaryAction={{
        content: "Edit Vendor",
        onAction: () => {
          window.open(
            "https://admin.shopify.com/store/" +
              storeName +
              "/content/entries/vendors/" +
              vendor.paramsId,
            "_blank",
          );
        },
      }}
      /*secondaryActions={[
        {
          content: "Draft",
          icon: ArchiveMinor,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Archive action"),
        },
        {
          content: "Decline",
          icon: DeleteMinor,
          destructive: true,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Delete action"),
        },
      ]}*/
    >
      <Card>
        <Banner onDismiss={() => {}}>
          Use this page to view and approve your vendor, you can edit all
          information on{" "}
          <Link
            target={"_blank"}
            url={
              "https://admin.shopify.com/store/" +
              storeName +
              "/content/entries/vendors/" +
              vendor.paramsId
            }
          >
            Metaobject
          </Link>{" "}
          page.
        </Banner>
      </Card>
      <Box minHeight="1rem" />
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="4">
        <InlineGrid gap="4">
          <Card roundedAbove="sm">
            <InlineGrid gap="4">
              {vendor.image && (
                <Thumbnail
                  source={vendor.image}
                  alt={vendor.title}
                  size={"large"}
                />
              )}
              <Text variant="headingMd" fontWeight="bold" as="span">
                {vendor.title}
              </Text>
              <Text as="span">{vendor.description}</Text>
            </InlineGrid>
          </Card>
        </InlineGrid>
        <InlineGrid gap={{ xs: "4", md: "2" }}>
          <Card roundedAbove="sm">
            <Text variant="headingMd" as={"h2"}>
              Settings
            </Text>
            <InlineGrid gap="4">
              <TextField
                label="Store commission"
                value={vendor.commission}
                autoComplete="off"
                disabled
              />
              <TextField
                label="Status"
                value={vendor.status}
                autoComplete="off"
                disabled
              />
            </InlineGrid>
          </Card>
        </InlineGrid>
      </InlineGrid>
    </Page>
  );
}
