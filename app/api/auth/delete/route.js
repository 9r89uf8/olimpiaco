// app/api/auth/register/route.js
import { adminAuth, adminDb } from '@/app/utils/firebaseAdmin';
import {authMiddleware} from "@/app/middleware/authMiddleware";
import {NextResponse} from "next/server";
import { withAuthRateLimit } from '@/app/utils/withAuthRateLimit';
export const dynamic = 'force-dynamic';



export async function deleteHandler(req) {
    try {
        const authResult = await authMiddleware(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const id = authResult.user.uid;

        // Delete the user's authentication record
        await adminDb.auth().deleteUser(id);

        // Delete the user's document from Firestore
        await adminDb.firestore().collection('users').doc(id).delete();
        let user = {}
        return new Response(JSON.stringify(user), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.log(error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
// Apply rate limiting with different limits for authenticated vs. unauthenticated users
export const GET = withAuthRateLimit(deleteHandler, {
    name: 'auth:check',
    // Higher limits for auth check since it's called frequently
    limit: 10,           // 60 requests per minute for unauthenticated users
    authLimit: 30,      // 300 requests per minute for authenticated users
    windowMs: 60 * 1000, // 1 minute window
});