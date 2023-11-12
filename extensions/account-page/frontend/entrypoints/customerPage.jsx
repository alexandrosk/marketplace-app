// @ts-nocheck
import "vite/modulepreload-polyfill";
import register from "preact-custom-element";
import { Router, Link } from "preact-router";
import { useSignal } from "@preact/signals";
import { createHashHistory } from "history";
import Menu from "~/components/Menu";
import ListingsPage from "../pages/Listings.jsx";
import ProfilePage from "../pages/ProfilePage";
import CreateProfilePage from "../pages/CreateProfilePage";
import DashboardPage from "../pages/Dashboard";
import { fetchProductsFromProxy, getProfile } from "~/utils/api";
import { useEffect, useState } from "react"; // Import ListingsPage
import CreateListingPage from "../pages/CreateListing.jsx";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

const TestPage = () => (
  <div>
    <h2>Test Page</h2>
    {/* Add your test page content here */}
  </div>
);

const CustomerPage = ({ customerid = "", settings = "" }) => {
  const count = useSignal(0);
  const customerId = customerid;
  const settingsData = JSON.parse(settings ?? "{}");
  console.log(JSON.parse(settings ?? "{}"));
  const [products, setProducts] = useState([]);
  const [isVendor, setIsVendor] = useState(false);
  const [underReview, setUnderReview] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileData, setProfileData] = useState(false);

  useEffect(() => {
    getProfile(customerId).then(function (response) {
      const status = JSON.parse(response.metaobject?.status?.value);
      if (response && status == "Approved") {
        setIsVendor(true);
        setProfileData(response.metaobject);
        fetchProductsFromProxy()
          .then((response) => setProducts(response.products))
          .catch((error) => console.error("Error fetching products:", error));
      } else if (response && status == "Pending") {
        setUnderReview(true);
      } else {
        setIsVendor(false);
        setUnderReview(false);
      }
      setIsLoaded(true);
    });
  }, [customerId]);

  const menuItems = [
    { label: "Dashboard", path: "/" },
    { label: "Profile", path: "/profile" },
    { label: "Listings", path: "/listings" },
    { label: "Settings", path: "/create-listing" },
    // Add more menu items here as needed
  ];

  return (
    <div>
      {(underReview && isLoaded && (
        <div className="under-review">
          <h2 className={"h2"}>Your shop profile is under review</h2>
          <p>
            Once your account is approved you will be able to start selling.
          </p>
        </div>
      )) ||
        (isLoaded && !isVendor && !underReview && (
          <div className="under-review">
            <h2 className={"h2"}>Your shop profile is declined</h2>
            <p>Please try again in the future.</p>
          </div>
        )) ||
        (!isVendor && (
          <div className="request-vendor">
            <Link href="/seller-form" class="">
              {settingsData.join_us}
            </Link>
            <Router history={createHashHistory()}>
              <CreateProfilePage
                path="/seller-form"
                count={count}
                customerId={customerId}
              />
            </Router>
          </div>
        )) ||
        (isVendor && (
          <div className="vendor-page overflow-hidden rounded-[0.5rem] border bg-background shadow">
            <div className=" space-y-6 p-10 pb-16 md:block">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">
                  Manage your seller account and listings
                </p>
              </div>

              <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                  <Menu items={menuItems} />
                </aside>
                <div className="flex-1 lg:max-w-4xl">
                  <Router history={createHashHistory()}>
                    <DashboardPage path="/" count={count} />
                    <ProfilePage
                      path="/profile"
                      isVendor={isVendor}
                      profileData={profileData}
                    />
                    <ListingsPage path="/listings" products={products} />
                    <CreateListingPage path="/create-listing" />
                    <TestPage path="/test" />
                  </Router>
                </div>
              </div>
            </div>
          </div>
        ))}
      <Toaster />
    </div>
  );
};

register(CustomerPage, "customer-page", ["customerid", "settings"], {
  shadow: false,
});
