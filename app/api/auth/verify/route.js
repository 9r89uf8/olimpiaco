// app/api/auth/register/route.js
import { adminAuth, adminDb } from '@/app/utils/firebaseAdmin';
import { authMiddleware } from "@/app/middleware/authMiddleware";
import { NextResponse } from "next/server";
import { withAuthRateLimit } from '@/app/utils/withAuthRateLimit';

export const dynamic = 'force-dynamic';

async function authCheckHandler(req) {
    try {
        const authResult = await authMiddleware(req);
        let isAuthenticated = authResult.authenticated;

        // If not authenticated at middleware level, return early
        if (!isAuthenticated) {
            return NextResponse.json({
                isAuthenticated: false,
                message: 'User not authenticated'
            }, { status: 401 });
        }
        const userRef = adminDb.firestore().collection('users').doc(authResult.user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            // Return 401 Unauthorized instead of throwing an error
            return NextResponse.json({
                isAuthenticated: false,
                message: 'User not found in database'
            }, { status: 401 });
        }

        const userData = userDoc.data();

        return NextResponse.json({ isAuthenticated, userData }, { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Apply rate limiting with different limits for authenticated vs. unauthenticated users
export const GET = withAuthRateLimit(authCheckHandler, {
    name: 'auth:check',
    // Higher limits for auth check since it's called frequently
    limit: 10,           // 60 requests per minute for unauthenticated users
    authLimit: 300,      // 300 requests per minute for authenticated users
    windowMs: 60 * 1000, // 1 minute window
});