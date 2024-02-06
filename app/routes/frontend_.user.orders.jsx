import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server"; // Adjust this import path as needed
import { ORDER_LIST_BY_VENDOR_QUERY } from "~/graphql/queries/orderListByVendor";

const fetchOders = async (admin, vendorId) => {
  const response = await admin.graphql(ORDER_LIST_BY_VENDOR_QUERY, {
    variables: { id: vendorId },
  });

  const responseJson = await response.json();
  console.log(JSON.stringify(responseJson));
  if (!responseJson.data.metaobject) {
    return [];
  }

  const filteredReferencers = responseJson.data.metaobject.referencedBy.nodes
    .filter(
      ({ referencer }) =>
        referencer.lineItems && // Ensure lineItems exists
        referencer.lineItems.nodes.some(
          (lineItem) =>
            lineItem.product &&
            lineItem.product.metafield &&
            lineItem.product.metafield.value === vendorId,
        ),
    )
    .map(({ referencer }) => {
      const commissionAmount = referencer.metafields.nodes
        .filter((metafield) => metafield.key === "payouts")
        .flatMap((metafield) => JSON.parse(metafield.value))
        .filter((payout) => payout.vendorId === vendorId)
        .reduce(
          (acc, payout) => acc + parseFloat(payout.commissionAmount || 0),
          0,
        );

      // Filter lineItems that match the targetMetaobjectId and merge with fullfilment id
      const mergedLineItems = referencer.lineItems.nodes
        .filter(
          (lineItem) =>
            lineItem.product &&
            lineItem.product.metafield &&
            lineItem.product.metafield.value === vendorId,
        )
        .map((lineItem) => {
          // Find matching fulfillmentOrders and their lineItems by product title
          const fulfillmentDetails = referencer.fulfillmentOrders.nodes
            .map((fo) => ({
              fulfillmentId: fo.id, // Capture the fulfillmentOrder ID
              lineItems: fo.lineItems.nodes
                .filter((fli) => fli.productTitle === lineItem.name)
                .map((fli) => ({
                  id: fli.id,
                  productTitle: fli.productTitle,
                  // Include any other properties you need from the fulfillmentLineItem
                })),
            }))
            .filter((fo) => fo.lineItems.length > 0); // Keep only fulfillmentOrders with matching lineItems

          return {
            ...lineItem, // Spread existing lineItem properties
            fulfillmentDetails, // Include fulfillment details with ID and lineItems
          };
        });

      // Return the desired details from referencer, including filtered lineItems
      return {
        id: referencer.id,
        name: referencer.name,
        createdAt: referencer.createdAt,
        shippingAddress: referencer.shippingAddress,
        status: referencer.displayFulfillmentStatus,
        email: referencer.email,
        amount: commissionAmount.toFixed(2),
        totalReceived: referencer.totalReceived,
        lineItems: mergedLineItems, // Include filtered lineItems here
        // Add more fields from referencer as needed
      };
    });
  return filteredReferencers;
};

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const vendorId = searchParams.get("vendorId");
  if (!shop || !vendorId) {
    return json(
      { error: "Shop or Customer ID parameter is missing" },
      { status: 400 },
    );
  }
  const { admin } = await authenticate.public.appProxy(request);

  const orders = await fetchOders(admin, vendorId);

  return json({ orders });
}

export async function action({ request }) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const vendorId = searchParams.get("logged_in_customer_id");
  if (!shop || !vendorId) {
    return json(
      { error: "Shop or Customer ID parameter is missing" },
      { status: 400 },
    );
  }
  const { admin } = await authenticate.public.appProxy(request);
  let orderData = await request.json();

  console.log(orderData);
  const response = await admin?.graphql(
    `#graphql
  mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
    fulfillmentCreateV2(fulfillment: $fulfillment) {
      fulfillment {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        fulfillment: {
          lineItemsByFulfillmentOrder: {
            fulfillmentOrderId: orderData.fulfillmentDetails.orderId,
            fulfillmentOrderLineItems: {
              id: orderData.fulfillmentDetails.itemId,
              quantity: orderData.fulfillmentDetails.quantity,
            },
          },
          notifyCustomer: true,
          trackingInfo: {
            number: orderData.voucher,
            url: orderData.courier_tracking,
          },
        },
      },
    },
  );
  const data = await response.json();
  console.log(data);
  return json({});
}
