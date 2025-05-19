// app/utils/rateLimit.js
import { adminDb } from './firebaseAdmin';

export async function rateLimit({
                                    ip,
                                    endpoint,
                                    limit = 10,
                                    windowMs = 60000, // 1 minute
                                }) {
    // Create a reference to the rate limiting collection
    const rateLimitRef = adminDb.firestore().collection('rateLimits');

    // Create a unique key for this IP and endpoint
    const key = `${ip}-${endpoint}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Transaction to safely update the rate limit data
    try {
        return await adminDb.firestore().runTransaction(async (transaction) => {
            const docRef = rateLimitRef.doc(key);
            const doc = await transaction.get(docRef);

            if (!doc.exists) {
                // First request from this IP for this endpoint
                transaction.set(docRef, {
                    requests: 1,
                    firstRequest: now,
                    lastRequest: now
                });
                return { success: true, remaining: limit - 1 };
            }

            const data = doc.data();

            // Check if we're in a new time window
            if (data.firstRequest < windowStart) {
                // Reset for new window
                transaction.update(docRef, {
                    requests: 1,
                    firstRequest: now,
                    lastRequest: now
                });
                return { success: true, remaining: limit - 1 };
            }

            // We're in the current window, check if limit is reached
            if (data.requests >= limit) {
                return {
                    success: false,
                    remaining: 0,
                    resetAt: data.firstRequest + windowMs
                };
            }

            // Update request count
            transaction.update(docRef, {
                requests: data.requests + 1,
                lastRequest: now
            });

            return {
                success: true,
                remaining: limit - data.requests - 1
            };
        });
    } catch (error) {
        console.error('Rate limiting error:', error);
        // Fail open - allow the request in case of errors with the rate limiter
        return { success: true, remaining: 0 };
    }
}