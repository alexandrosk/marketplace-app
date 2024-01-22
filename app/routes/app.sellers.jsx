import {
  Badge,
  Banner,
  Card,
  EmptyState,
  IndexFilters,
  IndexTable,
  Layout,
  Link,
  Page,
  Thumbnail,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "~/shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ImageIcon } from "@shopify/polaris-icons";

export async function action({ request }) {
  const { admin, session, sessionToken } = await authenticate.admin(request);

  const formData = await request.formData();
  const state = JSON.parse(formData.get("state"));
  //const responseJson = await response.json();

  //return json(responseJson.data);
}

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const QUERY = `
    {
      metaobjects(type: "vendors", first: 20, sortKey: "updated_at") {
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

          show_name: field(key: "show_name") {
            value
          }
          status: field(key: "status") {
            value
          }
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

  //create new object with only the fields we need
  const vendors = responseJson.data?.metaobjects?.nodes.map((vendor) => {
    return {
      id: vendor.id,
      handle: vendor.handle,
      description: vendor.description?.value,
      updatedAt: vendor.updatedAt,
      line_items: vendor.line_items?.value,
      published: vendor.capabilities?.publishable?.status,
      show_name: vendor.show_name?.value,
      title: vendor.title?.value,
      image: vendor.image?.reference?.image?.originalSrc,
      status: JSON.parse(vendor.status?.value),
    };
  });

  return {
    sellers: vendors || [],
    shop: session.shop,
  };
}

const EmptysellerState = ({ onAction }) => (
  <EmptyState
    heading="You can manually create your Vendors as metaobjects"
    action={{
      content: "Create a vendor",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>
      You can manually create your Vendors as metaobjects. You can also just
      wait for the first vendor sign up to come in and approve it here after.
    </p>
  </EmptyState>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

function handleApprove() {
  alert("a");
}

const SellerTableRow = ({ seller, shop }) => {
  const regex = /(\d+)$/;
  let sellerIdOnly = seller?.id?.match(regex);

  if (sellerIdOnly) {
    sellerIdOnly = sellerIdOnly[1];
  }
  const storeName = shop?.split(".")[0];
  return (
    <IndexTable.Row id={sellerIdOnly} position={sellerIdOnly}>
      <IndexTable.Cell>
        <Thumbnail
          source={seller.image || ImageIcon}
          alt={seller.productTitle}
          size="small"
        />
      </IndexTable.Cell>
      <IndexTable.Cell>{seller.title}</IndexTable.Cell>
      <IndexTable.Cell>
        <Link
          url={
            "https://admin.shopify.com/store/" +
            storeName +
            "/content/entries/vendors/" +
            sellerIdOnly
          }
          target={"_blank"}
        >
          {truncate(seller.handle)}
        </Link>
      </IndexTable.Cell>
      <IndexTable.Cell>{truncate(seller.description)}</IndexTable.Cell>

      <IndexTable.Cell>
        {new Date(seller.updatedAt).toDateString()}
      </IndexTable.Cell>
      <IndexTable.Cell>
        {(seller.status == "Approved" && (
          <Badge tone="success">Approved</Badge>
        )) ||
          (seller.status == "Declined" && (
            <Badge tone="critical">Declined</Badge>
          )) ||
          (seller.status == "Pending" && (
            <Badge tone="warning">Pending</Badge>
          )) || <Badge tone="info">Not assigned</Badge>}
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

export default function Index() {
  const { sellers, shop } = useLoaderData();
  const storeName = shop?.split(".")[0];
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [view, setView] = useState("All"); // possible values: "all", "pending"
  const [itemStrings, setItemStrings] = useState([
    "All",
    "Pending Approval",
    "Approved",
    "Declined",
  ]);
  const statusMapping = {
    "Pending Approval": "Pending",
    Approved: "Approved",
    Declined: "Declined",
  };
  const { mode, setMode } = useSetIndexFiltersMode();
  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {
      setView(item);
    },
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions: index === 0 ? [] : [],
  }));
  const displayedSellers = sellers.filter((seller) => {
    if (view === "All") return true;
    return seller.status == statusMapping[view];
  });

  const navigate = useNavigate();

  return (
    <Page
      divider
      title="Vendors"
      primaryAction={{
        content: "Create new vendor",
        onAction: () => {
          window.open(
            "https://admin.shopify.com/store/" +
              storeName +
              "/content/entries/vendors/new",
            "_blank",
          );
        },
      }}
      secondaryActions={[]}
    >
      <Layout>
        <Layout.Section>
          <Banner>
            Use this page to filter approved vendors, you can edit all
            information on{" "}
            <Link
              target={"_blank"}
              url={
                "https://admin.shopify.com/store/" +
                storeName +
                "/content/entries/vendors/"
              }
            >
              Vendors
            </Link>{" "}
            page.
            <br />
            Clicking a slug will open the Vendor edit page.
          </Banner>
          <br />
          <Card padding="0">
            <>
              <IndexFilters
                sortOptions={[]}
                sortSelected={[]}
                queryValue={""}
                queryPlaceholder="Searching in all"
                onQueryChange={() => {}}
                onQueryClear={() => {}}
                onSort={() => {}}
                cancelAction={{
                  onAction: () => {},
                  disabled: false,
                  loading: false,
                }}
                tabs={tabs}
                selected={tabs.indexOf(
                  tabs.find((tab) => tab.content === view),
                )}
                canCreateNewView={false}
                mode={mode}
                setMode={setMode}
              />
              {displayedSellers.length === 0 ? (
                <EmptysellerState onAction={() => navigate("sellers/new")} />
              ) : (
                <IndexTable
                  selectable={false}
                  selectedItemsCount={selectedSellers.length}
                  onSelectionChange={setSelectedSellers}
                  resourceName={{
                    singular: "Vendor",
                    plural: "Vendors",
                  }}
                  itemCount={displayedSellers.length}
                  headings={[
                    { title: "Thumbnail", hidden: true },
                    { title: "Title" },
                    { title: "Slug" },
                    { title: "Bio" },
                    { title: "Last update" },
                    { title: "Status" },
                  ]}
                >
                  {displayedSellers.map((seller) => (
                    <SellerTableRow
                      key={seller.id}
                      seller={seller}
                      shop={shop}
                    />
                  ))}
                </IndexTable>
              )}
            </>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
