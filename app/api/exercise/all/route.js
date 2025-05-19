// app/api/exercises/route.js

import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin'; // Your Firebase Admin SDK initialization
// Removed v4 as uuidv4 as it's not directly needed for GET all
// import { v4 as uuidv4 } from 'uuid'; // For unique filenames if needed

// --- POST function (if you have it from previous steps) would be here ---
// export async function POST(req) { ... }


/**
 * GET handler to fetch all exercises.
 * Retrieves exercises from Firestore, ordered by creation date (newest first).
 */
export async function GET(req) {
    try {
        const exercisesCollection = adminDb.firestore().collection('exercises');
        // Order by 'createdAt' in descending order. You can change this to 'name' or another field.
        const snapshot = await exercisesCollection.orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            return NextResponse.json({ exercises: [] }, { status: 200 });
        }

        const exercises = [];
        snapshot.forEach(doc => {
            exercises.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return NextResponse.json({ exercises }, { status: 200 });

    } catch (error) {
        console.error('Error fetching exercises:', error);
        return NextResponse.json({ error: 'Failed to fetch exercises.', details: error.message }, { status: 500 });
    }
}
