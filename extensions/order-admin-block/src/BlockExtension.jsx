import {
  AdminBlock,
  Badge,
  BlockStack,
  Button,
  InlineStack,
  reactExtension,
  Text,
  useApi,
} from "@shopify/ui-extensions-react/admin";
import { useEffect, useState } from "react";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.order-details.block.render";

async function getOrder(id) {
  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: `
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            metafield (key:"payouts", namespace:"vendor") {
              id
              value
            }
          }
        }
      `,
      variables: { id },
    }),
  });
  const result = await res.json();

  // Parse the metafield value if it exists
  console.log(result);

  // Guard clause for missing order or metafield data
  if (!result.data || !result.data.order || !result.data.order.metafield) {
    console.error("Order not found, or it lacks the expected metafield.");
    return null; // or {}, depending on how you want to handle this case.
  }
  let parsedValue = JSON.parse(result.data.order.metafield.value);

  // Ensure parsedValue is treated as an array, even if it's a single object
  if (!Array.isArray(parsedValue)) {
    parsedValue = [parsedValue];
  }

  const vendors = await Promise.all(
    parsedValue.map(async (vendorInfo) => {
      if (vendorInfo.vendorId) {
        const res2 = await fetch("shopify:admin/api/graphql.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
        query getMetaObject($id: ID!) {
            metaobject(id: $id) {
              id
              type
              slug: field(key: "slug") {
                value
              }
              capabilities {
                publishable {
                  status
                }
              }
              payment_details: field(key: "payment_details") {
                value
              }
              commission: field(key: "commission") {
                value
              }
              title: field(key: "title") {
                value
              }
              bio: field(key: "description") {
                value
              }
              enabled: field(key: "enabled") {
                value
              }
              url: field(key: "social") {
                value
              }
              status: field(key: "status") {
                value
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
            }
          }
      `,
            variables: { id: vendorInfo.vendorId },
          }),
        });
        const result2 = await res2.json();

        // Guard clause for missing metaobject data
        if (!result2.data || !result2.data.metaobject) {
          console.error(
            "Metaobject not found for vendorId:",
            vendorInfo.vendorId,
          );
          return null; // Decide how to handle missing metaobject info
        }

        // Return combined vendor info from the order and additional details fetched
        return {
          ...vendorInfo, // Contains commissionAmount among other details
          ...result2.data.metaobject, // Additional vendor details fetched
        };
      }
      return null;
    }),
  );

  const filteredVendors = vendors.filter((vendor) => vendor !== null);

  // Add fetched vendors info to the order object
  const orderWithVendors = {
    ...result.data.order,
    vendors: filteredVendors,
  };

  return orderWithVendors;
}

export default reactExtension(TARGET, () => <App />);

function App() {
  const {
    extension: { target },
    data,
  } = useApi(TARGET);
  const [order, setOrder] = useState();
  const [showPayout, setShowPayout] = useState(false);

  useEffect(() => {
    const orderId = data.selected?.[0]?.id;
    if (orderId) {
      getOrder(orderId).then(setOrder);
    }
  }, [data]);

  const markAsPaid = async (order, vendorId) => {
    // Add logic to mark the vendor as paid
    let metafieldValue = JSON.parse(order.metafield.value);
    metafieldValue = metafieldValue.map((payout) => {
      if (payout.vendorId === vendorId) {
        return { ...payout, paid: true }; // Mark as paid
      }
      return payout;
    });

    const res = await fetch("shopify:admin/api/graphql.json", {
      method: "POST",
      body: JSON.stringify({
        query: `
       mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
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
          }
        }
      }
      `,
        variables: {
          metafields: [
            {
              key: "payouts",
              namespace: "vendor",
              ownerId: order.id,
              value: JSON.stringify(metafieldValue),
            },
          ],
        },
      }),
    });
    const result = await res.json();
    console.log(result);

    console.log("Mark as paid", order, vendorId);
  };

  return (
    <AdminBlock title="Vendor Payouts">
      <BlockStack gap>
        <BlockStack gap>
          {order?.vendors?.map((vendor, index) => (
            <InlineStack
              key={index}
              gap
              inlineAlignment={"space-between"}
              paddingBlock
            >
              {(vendor.paid && <Badge tone="success">Paid</Badge>) || (
                <Badge tone="critical">Unpaid</Badge>
              )}
              <Text fontStyle={"italic"}>Vendor: {vendor.title.value}</Text>
              <Text fontWeight="bold">
                {/* Use the vendor's specific commissionAmount */}
                You have to pay {vendor.commissionAmount}
              </Text>

              <Button onPress={() => setShowPayout(!showPayout)}>
                {showPayout ? "Hide Details" : "Show Details"}
              </Button>
            </InlineStack>
          ))}
        </BlockStack>
        <BlockStack gap>
          {/* Optionally display payout information for all vendors when button is pressed */}
          {showPayout &&
            order?.vendors?.map((vendor, index) => (
              <>
                <InlineStack
                  key={index}
                  gap
                  blockGap="small"
                  blockAlignment="center"
                  inlineAlignment="space-between"
                >
                  <InlineStack inlineSize="75%">
                    {vendor.payment_details?.value && (
                      <Text>{vendor.payment_details.value}</Text>
                    )}
                  </InlineStack>
                  {!vendor.paid && (
                    <InlineStack
                      inlineSize="25%"
                      blockAlignment="end"
                      inlineAlignment="end"
                    >
                      <Button
                        variant={"primary"}
                        onClick={
                          // Add logic to mark the vendor as paid
                          () => markAsPaid(order, vendor.id)
                        }
                      >
                        Mark as paid
                      </Button>
                    </InlineStack>
                  )}
                </InlineStack>
              </>
            ))}
        </BlockStack>
      </BlockStack>
    </AdminBlock>
  );
}
