# Shopify Remix App Multivendor Metaobjects - WIP 🌐

![vendor page](./public/customer.png)
![create vendor](./public/start-selling.png)

### All contributions are welcome! 🙏
Refactor as much as you want, add new features, fix bugs, etc.
Since this was done as a demo

## Description 📝 
This is a shopify app that allows you to create a multivendor marketplace.
It uses metaobjects to create a vendor object that is connected to a collection.

The idea is that by using this app we will be able to create a multivendor marketplace that is fully customizable and scalable easily with shopify.


## Setup 🛠
This app uses shopify's [remix app template](https://github.com/Shopify/shopify-app-template-remix) as a base. 
Also it uses shopify [react vite](https://github.com/montalvomiguelo/theme-extension-vite) as a base for the frontend, theme app extension.

1. `pnpm i`
2. `pnpm run dev`
3. `cd extensions/account-page && pnpm i && pnpm run dev`
4. `Important for theme app extension: change the proxy url in the shopify app settings to your updated cloudflare url`


## To Do 📝

### Frontend Seller
- [ ] Webhook for new vendor -> collection
- [ ] Create new product - huge
  - [ ] Collection setup (after 1st product)
  - [ ] Location — add 1 - 2 - 3 locations and then connect with products
- [ ] Commission setup 
- [ ] Dashboard - connection with data
- [x] User settings 
  - [ ] Setup PayPal payments
- [x] Setup profile
  - [x] Profile Request
  - [x] Theme app extension for profile
  - [ ] Setup handle + SEO description on collection
  - [x] Bio, socials, titles etc & info

### Frontend Theme app extensions
- [ ] Extension for product page
- [X] Extension for collection page
- [x] Extension for account page/or related page

### Admin
- [ ] Only use Vendor as metaobject (some references to seller are still there)
- [ ] Send email for new vendor setup
- [x] Settings - like categories etc commission
- [x] Approve vendors
  - [x] Connect status
  - [x] + collection template + app block with dynamic info ?
  - [x] -> after approve create auto collection for products with vendorID?
- [x] Show vendor data and redirect to meta object 

### Webhooks 
- [ ] New vendor - create collection
- [ ] Disable vendor - disable collection & products
- [ ] Admin disables product - notify vendor
- [ ] New order notify vendor
- [ ] Vendor creates new product - notify admin?
