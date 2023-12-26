# Shopify Remix App Multivendor Metaobjects - WIP 🌐

![vendor page](./public/customer.png)
![create vendor](./public/start-selling.png)

### All contributions are welcome! 🙏
Refactor as much as you want, add new features, fix bugs, etc.
Since this was done as a demo and PoC for most of the time I didn't focus on the code quality and structure.

## Description 📝 
This is a shopify app that allows you to create a multivendor marketplace.
It uses metaobjects to create a vendor object that is connected to a collection.

The idea is that by using this app we will be able to create a multivendor marketplace that is fully customizable and scalable easily with shopify.


## Setup 🛠
This app uses shopify's [remix app template](https://github.com/Shopify/shopify-app-template-remix) as a base. 
Also, it uses shopify [react vite](https://github.com/montalvomiguelo/theme-extension-vite) as a base for the frontend, theme app extension.

1. `pnpm i`
2. `pnpm run dev`
3. `cd extensions/account-page && pnpm i && pnpm run dev`
4. Important for theme app extension: change the proxy url in the shopify app settings to your updated cloudflare url


## To Do 📝

### Frontend Seller
- [ ] Create new product - huge
  - [X] New product **[WIP]**
  - [ ] Show tags etc on product upload 
  - [X] Use staged upload to upload images
  - [ ] Product variants
  - [ ] Edit product
  - [ ] Google feed XML update products ? _[future]_
  - [x] Add product images
  - [x] Categories 
  - [x] Product qty set
  - [x] Product options and variants from admin settings
- [ ] Dashboard - connection with real data
  - [ ] Orders
  - [ ] Shipping
  - [ ] Sold products etc
- [ ] Shipping - let vendor add shipping costs on their products
- [x] User settings
  - [ ] Disable vendor button (webhook)
  - [ ] Locations to handle
  - [ ] Setup a way to get payments
- [x] Setup profile
  - [x] Profile Request
  - [x] Profile Image
  - [x] Theme app extension for profile
  - [ ] Setup handle + SEO description for vendor - collection pages
  - [x] Bio, socials, titles etc & info

### Frontend Theme app extensions
- [ ] Extension for product page - vendor info
- [ ] Extension for product page bottom - related products
- [X] Extension for collection page
- [x] Extension for account page/or related page

### Admin
- [ ] Setup Payouts page 
  - [ ] Connect orders with vendors and calculate payouts
  - [ ] Automatic payouts stripe (later)
- [ ] Send email for new vendor setup + approved 
  - [X] Email ResendAPi 
  - [ ] Email templates
- [ ] Settings - categories, variants, commission, shipping etc
  - [x] Mass update settings from state
  - [x] Variants setup
  - [x] Options for Variants setup modal 
  - [ ] Commission
- [ ] Approve Products manually
  - [ ] Page to Approve products (?)
  - [x] Add settings for selecting auto approval
  - [ ] Specific Vendor auto approve their products
- [ ] Approve vendors
  - [x] Add approval status
  - [x] collection template + app block with dynamic info ?
  - [ ] Webhook -> after approve create auto collection for products with vendorID?
- [x] Show vendor data and redirect to meta object 

### Webhooks 
- [ ] New vendor - create collection
- [ ] Edit vendor - update collection 
- [ ] Disable vendor - disable collection & products
- [ ] Admin disables product - notify vendor
- [ ] New order notify vendor
- [ ] Vendor creates new product - notify admin?
