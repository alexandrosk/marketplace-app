import { json } from "@remix-run/node";

import { authenticate } from "~/shopify.server";
import {
  CREATE_METAOBJECT_MUTATION,
  UPDATE_METAOBJECT,
} from "~/graphql/mutations/createMetaobject";
import { GET_METAOBJECT } from "~/graphql/queries/getMetaobject";
import { CUSTOMER_UPDATE_MUTATION } from "~/graphql/mutations/customerUpdate";
import { uploadFile } from "~/models/files.server";

export let action = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);

    const customerId = searchParams.get("logged_in_customer_id");
    const profileData = {};
    console.log(request);
    const formData = await request.formData();

    for (let [key, value] of formData) {
      profileData[key] = value;
    }

    const { admin } = await authenticate.public.appProxy(request);
    if (!admin) {
      return json({ error: "Invalid shop" }, { status: 400 });
    }

    //existing user so update vendor
    if (profileData.vendorId) {
      let imageUploads = { files: [] };
      if (profileData.image) {
        imageUploads = await uploadFile([profileData.image], admin?.graphql);
      }
      const response = await admin?.graphql(UPDATE_METAOBJECT, {
        variables: {
          metaobject: {
            fields: [
              /*handle && {
                key: "slug",
                value: profileData.username,
              },*/
              profileData.title && {
                key: "title",
                value: profileData.title,
              },
              profileData.payment_details && {
                key: "payment_details",
                value: profileData.payment_details,
              },
              profileData.bio && {
                key: "description",
                value: profileData.bio,
              },
              profileData.urls && {
                key: "social",
                //explode comma separated values into array
                value: JSON.stringify(profileData.urls.split(",")),
              },
              profileData.image && {
                key: "image",
                value: imageUploads.files[0].id,
              },
              {
                key: "enabled",
                value: profileData.enabled
                  ? profileData.enabled.toString()
                  : "false",
              },
            ],
          },
          id: profileData.vendorId,
        },
      });

      const responseJson = await response.json();
      if (responseJson.data.metaobjectUpdate.userErrors.length > 0) {
        console.log(JSON.stringify(responseJson));
        return json(
          { error: responseJson.data.metaobjectUpdate.userErrors[0].message },
          { status: 400 },
        );
      }
      return json({ error: "Vendor updated" }, { status: 200 });
    }

    //new user here so create a new vendor
    const response = await admin.graphql(CREATE_METAOBJECT_MUTATION, {
      variables: {
        metaobject: {
          type: "vendors",
          handle: profileData.username,
          capabilities: {
            publishable: {
              status: "ACTIVE",
            },
          },
          fields: [
            {
              key: "slug",
              value: profileData.username,
            },
            {
              key: "title",
              value: profileData.title,
            },
            {
              key: "description",
              value: profileData.bio,
            },
            {
              key: "status",
              value: JSON.stringify(["Pending"]),
            },
            {
              key: "general",
              value: JSON.stringify({
                previous_status: "pending",
                customerId: customerId,
              }),
            },
          ],
        },
      },
    });
    //data from graphql
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson.data));

    if (responseJson.data.metaobjectCreate.userErrors.length > 0) {
      return json(
        { error: responseJson.data.metaobjectCreate.userErrors[0].message },
        { status: 400 },
      );
    }

    const response2 = await admin.graphql(CUSTOMER_UPDATE_MUTATION, {
      variables: {
        input: {
          metafields: [
            {
              namespace: "custom",
              key: "vendor_id",
              value: responseJson.data.metaobjectCreate.metaobject.id,
            },
          ],
          id: "gid://shopify/Customer/" + customerId,
        },
      },
    });

    const responseJson2 = await response2.json();
    console.log(JSON.stringify(responseJson2.data));

    return json(responseJson2, { status: 200 });
  } catch (error) {
    console.log(error);
    return json({ error: error }, { status: 400 });
  }
};

export let loader = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return json({ error: "Invalid customer id" }, { status: 200 });
    }

    const { admin } = await authenticate.public.appProxy(request);
    if (!admin) {
      return json({ error: "Invalid shop" }, { status: 400 });
    }

    const response = await admin.graphql(GET_METAOBJECT, {
      variables: {
        id: customerId,
      },
    });
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson.data));
    return json(responseJson.data, { status: 200 });
  } catch (error) {
    return json({ error: JSON.stringify(error) }, { status: 400 });
  }
};
