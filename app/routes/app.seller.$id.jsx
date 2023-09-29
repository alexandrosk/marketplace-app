import {useState} from 'react';
import {
  Page,
  Button,
  Card,
  VerticalStack,
  Text,
  Box,
  HorizontalGrid,
  SkeletonDisplayText,
  Bleed, Divider, SkeletonBodyText
} from '@shopify/polaris';
import {ArchiveMinor, DeleteMinor, DuplicateMinor} from "@shopify/polaris-icons";
import { useRouteLoaderData } from "@remix-run/react";
import {json} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {authenticate} from "~/shopify.server";

export async function loader({ params, request })  {
  const sellerId = params.id;
  const { admin, session } = await authenticate.admin(request);

  const QUERY = `
    {
       metaobject(id: "gid://shopify/Metaobject/${sellerId}") {
        id
        handle
      }
    }
  `;

  const variables = {
    first: 1,  // You can customize this or make it dynamic
    after: "" // This can be made dynamic based on pagination or cursor
  };

  const response = await admin.graphql(QUERY);
  const responseJson = await response.json();
  return {
    seller: responseJson.data?.metaobject || {},
  };

};
export default function SellerPage() {
  const {seller} = useLoaderData();
  console.log(seller);
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
      backAction={{ content: "Sellers", url: "/app/sellers" }}
      title={seller.handle}
      secondaryActions={[
        {
          content: "Duplicate",
          icon: DuplicateMinor,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "Archive",
          icon: ArchiveMinor,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Archive action"),
        },
        {
          content: "Delete",
          icon: DeleteMinor,
          destructive: true,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Delete action"),
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <HorizontalGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="4">
        <VerticalStack gap="4">
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <SkeletonLabel />
              <Box  minHeight="2rem" />
              <SkeletonLabel maxWidth="8rem" />
              <Box  minHeight="20rem" />
            </VerticalStack>
          </Card>
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <SkeletonDisplayText size="small" />
              <HorizontalGrid columns={{ xs: 1, md: 2 }}>
                <Box minHeight="10rem" />
                <Box  minHeight="10rem" />
              </HorizontalGrid>
            </VerticalStack>
          </Card>
        </VerticalStack>
        <VerticalStack gap={{ xs: "4", md: "2" }}>
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <SkeletonDisplayText size="small" />
              <Box  minHeight="2rem" />
              <Box>
                <Bleed >
                  <Divider />
                </Bleed>
              </Box>
              <SkeletonLabel />
              <Divider />
              <SkeletonBodyText />
            </VerticalStack>
          </Card>
          <Card roundedAbove="sm">
            <VerticalStack gap="4">
              <SkeletonLabel />
              <Box  minHeight="2rem" />
              <SkeletonLabel maxWidth="4rem" />
              <Box  minHeight="2rem" />
              <SkeletonLabel />
              <SkeletonBodyText />
            </VerticalStack>
          </Card>
        </VerticalStack>
      </HorizontalGrid>
    </Page>
  )
}
