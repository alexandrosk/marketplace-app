//ORDERS_PAID
//ORDERS_CREATE
import { UPDATE_METAFIELD } from "~/graphql/mutations/updateMetafield";
import { GET_METAOBJECT } from "~/graphql/queries/getMetaobject";
import db from "~/db.server";

const getVendorInformation = async (admin, shop, vendorId, session) => {
  const response = await admin.graphql(GET_METAOBJECT, {
    variables: {
      id: vendorId,
    },
  });
  const responseJson = await response.json();
  /*console.log("responseJson", responseJson.data.metaobject);*/
  return responseJson.data.metaobject;
};

const updateOrderNote = async (order, note) => {
  order.vendor_info = [{ name: note, value: "true" }];
  await order.save({ update: false });
};

const updateOrderMetafields = async (admin, payload, vendorIds) => {
  console.log(JSON.stringify(vendorIds));
  try {
    const response = await admin.graphql(UPDATE_METAFIELD, {
      variables: {
        metafields: [
          {
            key: "vendor_ids",
            namespace: "vendor",
            ownerId: payload.admin_graphql_api_id,
            value: JSON.stringify(vendorIds.join(",")),
          },
        ],
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error in updateOrderMetafields:", JSON.stringify(error));
  }
};

const processVendorInformation = async (
  /** @type {{ rest: { resources: { Metafield: new (arg0: { session: any; }) => any; }; }; }} */ admin,
  /** @type {any} */ shop,
  /** @type {any} */ session,
  /** @type {any[]} */ vendorInfoWithLineItems,
  /** @type {string} */ payloadId,
) => {
  //load default commission in case we dont have the vendor one
  const settings = await db.settings.findFirst({
    where: { shop: session.shop },
  });

  return Promise.all(
    vendorInfoWithLineItems.map((vendor) =>
      getVendorInformation(admin, shop, vendor.vendorId, session).then(
        async (vendorInfo) => {
          const metafield = new admin.rest.resources.Metafield({
            session: session,
          });
          metafield.order_id = payloadId;
          metafield.namespace = "vendor";
          metafield.key = "payouts";
          metafield.type = "json";
          metafield.value = JSON.stringify([
            {
              vendorId: vendorInfo.id,
              commission:
                vendorInfo.commission?.value ?? settings?.default_commision,
              commissionAmount: (
                vendor.finalPrice -
                (parseFloat(
                  vendorInfo.commission?.value ?? settings?.default_commision,
                ) /
                  100) *
                  parseFloat(vendor.finalPrice) *
                  parseFloat(vendor.quantity)
              ).toFixed(2),
            },
          ]);
          await metafield.save({ update: true });
        },
      ),
    ),
  );
};

// Main function
export const orders_update = async (admin, shop, payload, session) => {
  try {
    if (payload.vendor_info.length > 0) {
      return new Response("already updated", { status: 200 });
    }

    const order = new admin.rest.resources.Order({ session: session });
    order.id = payload.id;

    //rest sleep
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep for 1 second

    const metafieldsResponses = await Promise.all(
      payload.line_items.map(
        (item) =>
          admin.rest.resources.Metafield.all({
            session: session,
            metafield: {
              owner_resource: "product",
              owner_id: item.product_id,
              namespace: "vendor",
            },
          }).then((response) => ({
            lineItemId: item.product_id,
            finalPrice: item.price,
            quantity: item.quantity,
            metafields: response.data,
          })), // Modified to include line item ID
      ),
    );
    if (metafieldsResponses.length === 0) {
      await updateOrderNote(order, "No Vendors Found");
      return new Response("no applicable vendors", { status: 200 });
    }

    const vendorInfoWithLineItems = metafieldsResponses.flatMap(
      ({ lineItemId, metafields, finalPrice, quantity }) =>
        metafields
          .filter((metafield) => metafield.key === "vendor_id")
          .map((mf) => ({
            vendorId: mf.value,
            lineItemId,
            finalPrice,
            quantity,
          })), // Map line item ID with vendor ID
    );

    const vendorIds = vendorInfoWithLineItems.map((info) => info.vendorId);

    await updateOrderMetafields(admin, payload, vendorIds);

    await updateOrderNote(order, "This order has been updated");

    //rest sleep
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await processVendorInformation(
      admin,
      shop,
      session,
      vendorInfoWithLineItems,
      payload.id,
    );

    console.log("All vendor information processed");
  } catch (error) {
    console.error("Error in orders_update:", JSON.stringify(error));
    //rest sleep
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
