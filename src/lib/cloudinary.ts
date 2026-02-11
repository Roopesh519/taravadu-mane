import { createHash } from 'crypto';

interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}

interface CloudinaryUploadResult {
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
}

function parseCloudinaryUrl(): CloudinaryConfig {
    const raw = process.env.CLOUDINARY_URL;
    if (!raw) {
        throw new Error('CLOUDINARY_CONFIG_ERROR:Missing CLOUDINARY_URL');
    }

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        throw new Error('CLOUDINARY_CONFIG_ERROR:Invalid CLOUDINARY_URL format');
    }

    if (url.protocol !== 'cloudinary:') {
        throw new Error('CLOUDINARY_CONFIG_ERROR:Invalid CLOUDINARY_URL protocol');
    }

    const apiKey = decodeURIComponent(url.username);
    const apiSecret = decodeURIComponent(url.password);
    const cloudName = decodeURIComponent(url.hostname);

    if (!apiKey || !apiSecret || !cloudName) {
        throw new Error('CLOUDINARY_CONFIG_ERROR:Invalid CLOUDINARY_URL credentials');
    }

    return { cloudName, apiKey, apiSecret };
}

function signParams(params: Record<string, string>, apiSecret: string) {
    const serialized = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export async function uploadGalleryImage(options: {
    bytes: Uint8Array;
    fileName: string;
    mimeType: string;
}) : Promise<CloudinaryUploadResult> {
    const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl();
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Delivers substantial compression while preserving visual quality.
    const uploadParams = {
        folder: 'taravadu-mane/gallery',
        timestamp,
        transformation: 'q_auto:good,f_auto,fl_progressive',
    };

    const signature = signParams(uploadParams, apiSecret);

    const form = new FormData();
    form.append('file', new Blob([options.bytes], { type: options.mimeType }), options.fileName);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('folder', uploadParams.folder);
    form.append('transformation', uploadParams.transformation);
    form.append('signature', signature);

    let response: Response;
    try {
        response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: form,
        });
    } catch (error: any) {
        const message = String(error?.message || 'Cloudinary request failed');
        const isNetworkError = /(ENETUNREACH|ETIMEDOUT|ECONNRESET|EAI_AGAIN|ENOTFOUND)/i.test(message);
        const code = isNetworkError ? 'CLOUDINARY_NETWORK_ERROR' : 'CLOUDINARY_REQUEST_ERROR';
        throw new Error(`${code}:${message}`);
    }

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(`CLOUDINARY_UPLOAD_ERROR:${payload?.error?.message || 'Cloudinary upload failed'}`);
    }

    return {
        secureUrl: payload.secure_url,
        publicId: payload.public_id,
        width: payload.width,
        height: payload.height,
        bytes: payload.bytes,
        format: payload.format,
    };
}
