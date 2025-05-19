// app/api/workouts/single/route.js

import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

/**
 * GET handler to fetch a single workout by its ID, with its exercises populated.
 * @param {Request} req - The incoming request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.workoutId - The ID of the workout to fetch.
 */
export async function GET(req, { params }) {
    try {
        const { workoutId } = await params;

        if (!workoutId) {
            return NextResponse.json({ error: 'Workout ID is required.' }, { status: 400 });
        }

        // 1. Fetch the workout document
        const workoutDocRef = adminDb.firestore().collection('workouts').doc(workoutId);
        const workoutDoc = await workoutDocRef.get();

        if (!workoutDoc.exists) {
            return NextResponse.json({ error: 'Workout not found.' }, { status: 404 });
        }

        const workoutData = workoutDoc.data();
        const exerciseIds = workoutData.exerciseIds;

        let populatedExercises = [];

        // 2. Fetch details for each exercise ID if they exist
        if (exerciseIds && exerciseIds.length > 0) {
            // Create an array of promises to fetch all exercises concurrently
            const exercisePromises = exerciseIds.map(id =>
                adminDb.firestore().collection('exercises').doc(id).get()
            );

            const exerciseDocsSnapshots = await Promise.all(exercisePromises);

            populatedExercises = exerciseDocsSnapshots.map(docSnapshot => {
                if (docSnapshot.exists) {
                    return { id: docSnapshot.id, ...docSnapshot.data() };
                }
                return null; // Or handle missing exercises differently, e.g., log an error
            }).filter(exercise => exercise !== null); // Filter out any nulls if an exercise ID was invalid
        }

        // 3. Return the workout with populated exercises
        const responsePayload = {
            id: workoutDoc.id,
            ...workoutData,
            exercises: populatedExercises, // Replace/add exercise details
        };
        // It's good practice to remove the original exerciseIds if you're replacing it with full objects,
        // or ensure your frontend knows which one to use. Here, we'll assume 'exercises' is the primary source.
        // delete responsePayload.exerciseIds; // Optional: if you only want the populated array

        return NextResponse.json(responsePayload, { status: 200 });

    } catch (error) {
        console.error(`Error fetching workout ${params.workoutId}:`, error);
        return NextResponse.json({ error: 'Failed to fetch workout.', details: error.message }, { status: 500 });
    }
}
