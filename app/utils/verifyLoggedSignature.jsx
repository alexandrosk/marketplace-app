import crypto from "crypto";
import {parse} from "url";


const SHARED_SECRET = process.env.SHOPIFY_API_SECRET;

function verifySignature(url) {
    const parsedUrl = parse(url, true);
    const { query } = parsedUrl;
    const { signature, ...queryParams } = query;

    const sortedParams = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
        .sort()
        .join('');

    const calculatedSignature = crypto
        // @ts-ignore
        .createHmac('sha256', SHARED_SECRET)
        .update(sortedParams)
        .digest('hex');

    if (signature !== calculatedSignature) {
        throw new Error('Invalid signature');
    }
}

export default verifySignature;
