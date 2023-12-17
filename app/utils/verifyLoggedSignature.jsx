import crypto from "crypto";
import { parse } from "url";
import { json } from "@remix-run/node";

const SHARED_SECRET = process.env.SHOPIFY_API_SECRET;

function verifySignature(url, loggedIn = false) {
  if (loggedIn) {
    const { searchParams } = new URL(url);
    const customerId = searchParams.get("logged_in_customer_id");
    if (!customerId) {
      throw new Error("Unauthorized");
    }
  }
  const parsedUrl = parse(url, true);
  const { query } = parsedUrl;
  const { signature, ...queryParams } = query;

  const sortedParams = Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${key}=${Array.isArray(value) ? value.join(",") : value}`,
    )
    .sort()
    .join("");

  const calculatedSignature = crypto
    // @ts-ignore
    .createHmac("sha256", SHARED_SECRET)
    .update(sortedParams)
    .digest("hex");

  if (signature !== calculatedSignature) {
    throw new Error("Invalid signature");
  }
}

export default verifySignature;
