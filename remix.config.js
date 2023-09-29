// eslint-disable-next-line no-warning-comments
// TODO: Document this properly somewhere. Where? We should discuss this issue with the CLI team.
// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the remix server. The CLI will eventually
// stop passing in HOST, so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  serverModuleFormat: "cjs",
  serverDependenciesToBundle: [
    "@shopify/polaris-viz",
    "@juggle/resize-observer",
    "@react-spring/animated",
    "@react-spring/core",
    "@react-spring/shared",
    "@react-spring/types",
    "@react-spring/web",
    "@shopify/polaris-viz",
    "@shopify/polaris-viz-core",
    "d3-array",
    "d3-color",
    "d3-format",
    "d3-interpolate",
    "d3-path",
    "d3-scale",
    "d3-shape",
    "d3-time",
    "d3-time-format",
    "internmap",
    "use-debounce"
  ],
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    v2_dev: {
      port: process.env.HMR_SERVER_PORT || 8002,
    },
  },
};
