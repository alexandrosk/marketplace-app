import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: 'extensions/account-page'
    }),
    preact()
  ]
})