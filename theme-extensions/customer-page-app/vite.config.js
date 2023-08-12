// @ts-ignore
import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import preact from '@preact/preset-vite'
import path from "path"

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: '../../extensions/account-page'
    }),
    preact(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/@")
    }
  }
})
