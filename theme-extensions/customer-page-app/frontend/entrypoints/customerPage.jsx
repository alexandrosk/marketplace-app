// @ts-nocheck
import 'vite/modulepreload-polyfill'
import register from 'preact-custom-element'
import { Router, Link } from 'preact-router'
import { useSignal } from '@preact/signals'
import { createHashHistory } from 'history'
import Menu from "~/components/Menu";
import ListingsPage from '../pages/Listings.jsx';
import ProfilePage  from "../pages/ProfilePage"
import {fetchProductsFromProxy} from "~/utils/api";
import {useEffect, useState} from "react"; // Import ListingsPage
import CreateListingPage from '../pages/CreateListing.jsx';
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
const CounterPage = ({ count }) => (
    <div className="x-counter">
        <p className="x-counter__count">{count}</p>
        <Button onClick={() => count.value--}>-1</Button>
        <Button onClick={() => count.value++}>+1</Button>
    </div>
);

const TestPage = () => (
    <div>
        <h2>Test Page</h2>
        {/* Add your test page content here */}
    </div>
);

const CustomerPage = () => {
  const count = useSignal(0);

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProductsFromProxy()
            .then(response => setProducts(response.products))
            .catch(error => console.error('Error fetching products:', error));
    }, []);

  const menuItems = [
        { label: 'Counter', path: '/' },
        { label: 'Profile', path: '/profile' },
        { label: 'Listings', path: '/listings' },
        { label: 'Create New Listing', path: '/create-listing' },
        // Add more menu items here as needed
  ];

  return (
      <div>

          <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow">
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
                      <div className="flex-1 lg:max-w-2xl">
                          <Router history={createHashHistory()}>
                              <CounterPage path="/" count={count} />
                              <ProfilePage path="/profile" />
                              <ListingsPage path="/listings" products={products} />
                              <CreateListingPage path="/create-listing" />
                              <TestPage path="/test" />
                          </Router>
                      </div>
                  </div>
              </div>
          </div>
          <Toaster />
      </div>
  );
}


register(CustomerPage, 'customer-page', [], { shadow: false })
