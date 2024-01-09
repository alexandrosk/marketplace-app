import {
  AdminBlock,
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
  if (result.data.order.metafield) {
    result.data.order.metafield.parsedValue = JSON.parse(
      result.data.order.metafield.value,
    );
  }

  return result.data.order;
}

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const {
    extension: { target },
    i18n,
    data,
  } = useApi(TARGET);
  const [order, setOrder] = useState();

  useEffect(() => {
    const orderId = data.selected?.[0]?.id;
    getOrder(orderId).then((order) => setOrder(order));
  }, [data]);

  // Accessing the parsed data
  const vendorId = order?.metafield?.parsedValue?.[0]?.vendorId;
  const commissionAmount = order?.metafield?.parsedValue?.[0]?.commissionAmount;

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title="Vendor Payouts">
      <BlockStack>
        <InlineStack gap inlineAlignment={"space-between"}>
          <Text fontStyle={"italic"}>Vendor ID: {vendorId}</Text>
          <Text fontWeight="bold">
            {/*{i18n.translate("Payload amount:", { target })}{" "}*/}
            You have to pay {commissionAmount}
          </Text>
          <Text fontStyle={"italic"}>Shipped</Text>
          <Button
            onPress={() => {
              console.log("onPress event");
            }}
          >
            Pay now
          </Button>
        </InlineStack>
      </BlockStack>
    </AdminBlock>
  );
}
