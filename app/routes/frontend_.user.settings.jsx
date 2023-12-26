import { json } from "@remix-run/node";
import verifySignature from "~/utils/verifyLoggedSignature";
import { unauthenticated } from "~/shopify.server";

async function getFormData(request) {
  const requestData = await request.text();
  return JSON.parse(requestData);
}

async function createMetaobject(admin, username) {
  let handle = username.replace(/\s+/g, "-").toLowerCase();

  const response = await admin.graphql(
    `#graphql
    mutation CreateMetaobjectSimple($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          id
        }
        userErrors {
          message
        }
      }
    }`,
    {
      variables: {
        metaobject: {
          type: "vendors",
          handle: handle,
          fields: [{ key: "slug", value: handle }],
        },
      },
    },
  );

  const responseJson = await response.json();
  return responseJson.data.metaobjectCreate.metaobject.id;
}

async function updateCustomerMetafields(admin, customerId, vendorId) {
  const response = await admin.graphql(
    `#graphql
    mutation UpdateCustomerMetafields($input: CustomerInput!) {
      customerUpdate(input: $input) {
        userErrors {
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          metafields: [
            { namespace: "custom", key: "vendor_id", value: vendorId },
          ],
          id: `gid://shopify/Customer/${customerId}`,
        },
      },
    },
  );

  return response.json();
}

export let action = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const customerId = searchParams.get("logged_in_customer_id");

    const formData = await getFormData(request);
    const { admin } = await unauthenticated.admin(shop ?? "");

    const vendorId = await createMetaobject(admin, formData.username);
    const updateResponse = await updateCustomerMetafields(
      admin,
      customerId,
      vendorId,
    );

    console.log(JSON.stringify(updateResponse.data));

    return json(updateResponse, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ error: error.message }, { status: 400 });
  }
};
