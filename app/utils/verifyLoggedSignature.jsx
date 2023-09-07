import crypto from "crypto";
import {parse} from "url";


const SHARED_SECRET = '173475c3e712bc220cb191c8075626ab';

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
