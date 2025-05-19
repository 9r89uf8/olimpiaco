// app/utils/withRateLimit.js
import { headers } from 'next/headers';
import { rateLimit } from './rateLimit';

export function withRateLimit(handler, options = {}) {
    return async function rateLimited(req) {
        // Skip rate limiting in development environment
        if (process.env.NODE_ENV === 'development' && !options.enforceInDevelopment) {
            return handler(req);
        }

        const headersList = headers();

        // Get the real IP address using various headers that might be set by proxies
        let ip = headersList.get('x-real-ip') ||
            headersList.get('x-forwarded-for')?.split(',')[0] ||
            headersList.get('cf-connecting-ip') ||  // Cloudflare
            '::1';

        // Normalize IPv6 localhost to a consistent value
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            ip = 'localhost';
        }

        // Get endpoint name from URL
        const url = new URL(req.url);
        const endpoint = options.name || url.pathname;

        function getClientIdentifier(req, headersList) {
            // Get the real IP
            const ip = headersList.get('x-real-ip') ||
                headersList.get('x-forwarded-for')?.split(',')[0] ||
                headersList.get('cf-connecting-ip') ||
                '::1';

            // You can include additional client identifiers
            const userAgent = headersList.get('user-agent') || '';

            // For non-browser clients that might be automated
            if (!userAgent.includes('Mozilla')) {
                // Apply stricter limits for potential bots/scripts
                return `bot-${ip}`;
            }

            return ip;
        }

// Then use this function in your withRateLimit wrapper
        const clientId = getClientIdentifier(req, headersList);

        // Apply rate limiting
        const result = await rateLimit({
            ip: clientId,
            endpoint,
            limit: options.limit || 5,  // Default limit: 5 requests
            windowMs: options.windowMs || 60000,  // Default window: 1 minute
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