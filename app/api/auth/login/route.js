// app/api/login/route.js
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/utils/firebaseClient';
import { adminDb } from '@/app/utils/firebaseAdmin';
import { cookies } from 'next/headers';
import { withRateLimit } from '@/app/utils/withRateLimit';


export async function loginHandler(request) {
    const { email, password, turnstileToken } = await request.json();

    try {
        // // Verify the turnstile token
        // const verificationResponse = await fetch(
        //     'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        //     {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             secret: process.env.TURNSTILE_SECRET_KEY,
        //             response: turnstileToken,
        //         }),
        //     }
        // );
        //
        // const verification = await verificationResponse.json();
        // if (!verification.success) {
        //     return new Response(JSON.stringify({ error: 'Invalid CAPTCHA' }), {
        //         status: 400,
        //         headers: { 'Content-Type': 'application/json' },
        //     });
        // }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        // Set the session duration (e.g., 48 hours)
        const expiresIn = 48 * 60 * 60 * 1000; // in milliseconds

        // Create a session cookie with the specified expiration time
        const sessionCookie = await adminDb.auth().createSessionCookie(token, { expiresIn });

        // Reference to the user document
        const userRef = adminDb.firestore().collection('users').doc(userCredential.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found in Firestore');
        }

        const userData = userDoc.data();

        // Check premium status and expiration
        if (userData.premium && userData.expirationDate) {
            const now = adminDb.firestore.Timestamp.now();

            if (now.toMillis() > userData.expirationDate.toMillis()) {
                // Premium has expired, update the user document
                await userRef.update({
                    premium: false,
                    expirationDate: null,
                    expired: true
                });

                // Update the local userData object to reflect these changes
                userData.premium = false;
                userData.expirationDate = null;
            }
        }
        // Set the token in an httpOnly cookie
        const cookieStore = cookies();
        cookieStore.set('tokenAIBASE', sessionCookie, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: expiresIn / 1000, // Convert to seconds
        });

        return new Response(JSON.stringify({ user: userData, token }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.log(error.message)
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export const POST = withRateLimit(loginHandler, {
    name: 'auth:login',
    limit: process.env.NODE_ENV === 'production' ? 10 : 100, // Higher limit in dev
    windowMs: 60 * 60 * 1000, // 1 hour
    enforceInDevelopment: false // Set to true if you want to test rate limiting locally
});
