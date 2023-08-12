import crypto from "crypto";
import {parse} from "url";


const SHARED_SECRET = '9d7ecd119f3d9d68ebc97e9b1b962ea3';

function verifySignature(url) {
    const parsedUrl = parse(url, true);
    const { query } = parsedUrl;
    const { signature, ...queryParams } = query;

    const sortedParams = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`)
        .sort()
        .join('');

    const calculatedSignature = crypto
        .createHmac('sha256', SHARED_SECRET)
        .update(sortedParams)
        .digest('hex');

    if (signature !== calculatedSignature) {
        throw new Error('Invalid signature');
    }
}

export default verifySignature;
