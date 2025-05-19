// app/utils/withAuthRateLimit.js
import { cookies } from "next/headers";
import { headers } from 'next/headers';
import { adminAuth } from './firebaseAdmin';
import { rateLimit } from './rateLimit';

export function withAuthRateLimit(handler, options = {}) {
    return async function authRateLimited(req) {
        // Try to get user ID from authentication
        const cookieStore = cookies();
        const token = cookieStore.get('tokenAIGF')?.value;
        let userId = null;

        if (token) {
            try {
                const decodedToken = await adminAuth.verifySessionCookie(token);
                userId = decodedToken.uid;
            } catch (error) {
                // Invalid token, continue with IP-based rate limiting
                console.error("Invalid session token:", error);
            }
        }

        // Now apply rate limiting with either userId or IP
        const headersList = headers();
        const ip = userId ||
            headersList.get('x-real-ip') ||
            headersList.get('x-forwarded-for')?.split(',')[0] ||
            '::1';

        // Apply different limits based on auth status
        const limit = userId ? (options.authLimit || 20) : (options.limit || 5);

        const result = await rateLimit({
            ip,
            endpoint: options.name || new URL(req.url).pathname,
            limit,
            windowMs: options.windowMs || 60000,
        });

        if (!result.success) {
            // Rate limit exceeded
            return new Response(
                JSON.stringify({
                    error: 'Too many requests, please try again later',
                    resetAt: result.resetAt
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': options.limit || 5,
                        'X-RateLimit-Remaining': 0,
                        'X-RateLimit-Reset': result.resetAt,
                    },
                }
            );
        }

        // Add rate limit headers to the response
        const originalResponse = await handler(req);
        const response = new Response(originalResponse.body, originalResponse);

        response.headers.set('X-RateLimit-Limit', options.limit || 5);
        response.headers.set('X-RateLimit-Remaining', result.remaining);

        return response;
    };
}