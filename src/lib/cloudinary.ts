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
        throw new Error('Missing CLOUDINARY_URL');
    }

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        throw new Error('Invalid CLOUDINARY_URL format');
    }

    if (url.protocol !== 'cloudinary:') {
        throw new Error('Invalid CLOUDINARY_URL protocol');
    }

    const apiKey = decodeURIComponent(url.username);
    const apiSecret = decodeURIComponent(url.password);
    const cloudName = decodeURIComponent(url.hostname);

    if (!apiKey || !apiSecret || !cloudName) {
        throw new Error('Invalid CLOUDINARY_URL credentials');
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
    buffer: Buffer;
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
    form.append('file', new Blob([options.buffer], { type: options.mimeType }), options.fileName);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('folder', uploadParams.folder);
    form.append('transformation', uploadParams.transformation);
    form.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error?.message || 'Cloudinary upload failed');
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
