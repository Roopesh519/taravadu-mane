import { createHash } from 'crypto';
import type { Firestore } from 'firebase-admin/firestore';

interface RateLimitOptions {
    db: Firestore;
    req: Request;
    routeKey: string;
    maxRequests: number;
    windowMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds?: number;
}

function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    return 'unknown';
}

function hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

export async function enforceIpRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const { db, req, routeKey, maxRequests, windowMs } = options;
    const ip = getClientIp(req);
    const ipHash = hashValue(ip);
    const docRef = db.collection('api_rate_limits').doc(`${routeKey}:${ipHash}`);
    const now = Date.now();

    const result = await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(docRef);

        if (!snapshot.exists) {
            tx.set(docRef, {
                route_key: routeKey,
                ip_hash: ipHash,
                count: 1,
                window_started_at_ms: now,
                updated_at: new Date(now),
                expires_at: new Date(now + windowMs * 2),
            });
            return { allowed: true } as RateLimitResult;
        }

        const data = snapshot.data() || {};
        const windowStartedAt = Number(data.window_started_at_ms || 0);
        const count = Number(data.count || 0);
        const elapsed = now - windowStartedAt;

        if (elapsed >= windowMs) {
            tx.set(
                docRef,
                {
                    count: 1,
                    window_started_at_ms: now,
                    updated_at: new Date(now),
                    expires_at: new Date(now + windowMs * 2),
                },
                { merge: true }
            );
            return { allowed: true } as RateLimitResult;
        }

        if (count >= maxRequests) {
            const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
            return { allowed: false, retryAfterSeconds } as RateLimitResult;
        }

        tx.set(
            docRef,
            {
                count: count + 1,
                updated_at: new Date(now),
                expires_at: new Date(now + windowMs * 2),
            },
            { merge: true }
        );
        return { allowed: true } as RateLimitResult;
    });

    return result;
}
