// app/api/workouts/route.js

import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin'; // Your Firebase Admin SDK initialization

/**
 * POST handler to create a new workout.
 * Expects JSON body with:
 * {
 * name: "Workout Name",
 * exerciseIds: ["exerciseId1", "exerciseId2", ...]
 * // Optional: userId if you want to associate workouts with users
 * }
 */
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, exerciseIds, userId } = body; // Destructure userId if you plan to use it

        // Validate input
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Workout name is required and must be a non-empty string.' }, { status: 400 });
        }
        if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
            return NextResponse.json({ error: 'At least one exercise ID must be provided in an array.' }, { status: 400 });
        }
        // Optional: Validate that all exerciseIds are valid strings
        if (!exerciseIds.every(id => typeof id === 'string' && id.trim() !== '')) {
            return NextResponse.json({ error: 'All exercise IDs must be non-empty strings.' }, { status: 400 });
        }

        const workoutData = {
            name: name.trim(),
            exerciseIds,
            // userId: userId || null, // Uncomment if you add user association
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to Firestore 'workouts' collection
        const workoutsCollection = adminDb.firestore().collection('workouts');
        const docRef = await workoutsCollection.add(workoutData);

        return NextResponse.json({
            message: 'Workout created successfully!',
            workoutId: docRef.id,
            data: { id: docRef.id, ...workoutData },
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating workout:', error);
        if (error instanceof SyntaxError) { // JSON parsing error
            return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create workout.', details: error.message }, { status: 500 });
    }
}

/**
 * GET handler to fetch all workouts (optional for now, but good to have).
 * Retrieves workouts from Firestore, ordered by creation date (newest first).
 */
export async function GET(req) {
    try {
        // Optional: Add query parameter handling for fetching by userId
        // const { searchParams } = new URL(req.url);
        // const userId = searchParams.get('userId');

        const workoutsCollection = adminDb.firestore().collection('workouts');
        let query = workoutsCollection.orderBy('createdAt', 'desc');

        // if (userId) {
        //   query = query.where('userId', '==', userId);
        // }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return NextResponse.json({ workouts: [] }, { status: 200 });
        }

        const workouts = [];
        snapshot.forEach(doc => {
            workouts.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return NextResponse.json({ workouts }, { status: 200 });

    } catch (error) {
        console.error('Error fetching workouts:', error);
        return NextResponse.json({ error: 'Failed to fetch workouts.', details: error.message }, { status: 500 });
    }
}

/**
 * PUT handler to update an existing workout by its ID.
 * Expects JSON body with fields to update:
 * {
 * name?: "New Workout Name",
 * exerciseIds?: ["newExerciseId1", "newExerciseId2", ...]
 * }
 * @param {Request} req - The incoming request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.workoutId - The ID of the workout to update.
 */
export async function PUT(req) {
    try {
        const body = await req.json();
        const { name, exerciseIds, workoutId } = body;

        if (!workoutId) {
            return NextResponse.json({ error: 'Workout ID is required for updating.' }, { status: 400 });
        }

        const updateData = {};
        let hasUpdates = false;

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') {
                return NextResponse.json({ error: 'Workout name must be a non-empty string if provided.' }, { status: 400 });
            }
            updateData.name = name.trim();
            hasUpdates = true;
        }

        if (exerciseIds !== undefined) {
            if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
                return NextResponse.json({ error: 'If provided, exerciseIds must be a non-empty array.' }, { status: 400 });
            }
            if (!exerciseIds.every(id => typeof id === 'string' && id.trim() !== '')) {
                return NextResponse.json({ error: 'All exercise IDs in the array must be non-empty strings.' }, { status: 400 });
            }
            updateData.exerciseIds = exerciseIds;
            hasUpdates = true;
        }

        if (!hasUpdates) {
            return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
        }

        updateData.updatedAt = new Date().toISOString();

        const workoutDocRef = adminDb.firestore().collection('workouts').doc(workoutId);
        const docSnap = await workoutDocRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Workout not found to update.' }, { status: 404 });
        }

        await workoutDocRef.update(updateData);

        const updatedDocSnap = await workoutDocRef.get(); // Fetch the updated document

        return NextResponse.json({
            message: 'Workout updated successfully!',
            workout: { id: updatedDocSnap.id, ...updatedDocSnap.data() },
        }, { status: 200 });

    } catch (error) {
        console.error(`Error updating workout:`, error);
        if (error instanceof SyntaxError) { // JSON parsing error
            return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update workout.', details: error.message }, { status: 500 });
    }
}

/**
 * DELETE handler to remove a workout by its ID.
 * @param {Request} req - The incoming request object. (Not typically used for DELETE body, but Next.js provides it)
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.workoutId - The ID of the workout to delete.
 */
export async function DELETE(req) {
    try {
        const body = await req.json();
        const workoutId = body;

        if (!workoutId) {
            return NextResponse.json({ error: 'Workout ID is required for deletion.' }, { status: 400 });
        }

        const workoutDocRef = adminDb.firestore().collection('workouts').doc(workoutId);
        const docSnap = await workoutDocRef.get();


        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Workout not found to delete.' }, { status: 404 });
        }

        await workoutDocRef.delete();

        return NextResponse.json({ message: 'Workout deleted successfully!' }, { status: 200 });
        // Alternatively, you can return a 204 No Content status for successful deletions
        // return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error(`Error deleting workout:`, error);
        return NextResponse.json({ error: 'Failed to delete workout.', details: error.message }, { status: 500 });
    }
}
