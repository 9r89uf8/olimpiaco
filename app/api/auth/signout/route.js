import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();

    // Clear the token cookie
    cookieStore.set('tokenAIBASE', '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: -1, // Immediately expire the cookie
    });

    return new NextResponse(JSON.stringify({ message: 'Sign out successful' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}