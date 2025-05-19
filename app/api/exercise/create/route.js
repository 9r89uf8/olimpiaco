// app/api/exercises/route.js

import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin'; // Your Firebase Admin SDK initialization
import { uploadToFirebaseStorage } from '@/app/middleware/firebaseStorage'; // Your storage upload function
import { v4 as uuidv4 } from 'uuid'; // For unique filenames if needed

// Helper function to get file extension
const getFileExtension = (fileName) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * POST handler to create a new exercise.
 * Expects multipart/form-data with exercise details and optional image files.
 */
export async function POST(req) {
    try {
        const formData = await req.formData();

        // --- 1. Extract Text Data ---
        const name = formData.get('name');
        const equipment = formData.get('equipment');
        const sets = formData.get('sets');
        const reps = formData.get('reps');
        const rest = formData.get('rest') || ''; // Optional field
        const notes = formData.get('notes') || ''; // Optional field

        // Basic validation for required text fields
        if (!name || !equipment || !sets || !reps) {
            return NextResponse.json({ error: 'Missing required fields: name, equipment, sets, reps.' }, { status: 400 });
        }

        // --- 2. Handle Image Uploads (if provided) ---
        const exerciseImageFile = formData.get('exerciseImageFile'); // Assuming form sends file with this key
        const equipmentImageFile = formData.get('equipmentImageFile'); // Assuming form sends file with this key

        let exerciseImageUrl = formData.get('exerciseImageUrl') || null; // Fallback if URL is sent directly and no file
        let equipmentImageUrl = formData.get('equipmentImageUrl') || null; // Fallback

        // Upload Exercise Image
        if (exerciseImageFile && typeof exerciseImageFile.arrayBuffer === 'function') {
            try {
                const exerciseImageBuffer = Buffer.from(await exerciseImageFile.arrayBuffer());
                const exerciseImageFileName = `exercises/${uuidv4()}.${getFileExtension(exerciseImageFile.name)}`;
                exerciseImageUrl = await uploadToFirebaseStorage(exerciseImageBuffer, exerciseImageFileName, exerciseImageFile.type);
            } catch (uploadError) {
                console.error('Error uploading exercise image:', uploadError);
                // Decide if this is a critical error or if you want to proceed without the image
                // return NextResponse.json({ error: 'Failed to upload exercise image.', details: uploadError.message }, { status: 500 });
            }
        }

        // Upload Equipment Image
        if (equipmentImageFile && typeof equipmentImageFile.arrayBuffer === 'function') {
            try {
                const equipmentImageBuffer = Buffer.from(await equipmentImageFile.arrayBuffer());
                const equipmentImageFileName = `equipment/${uuidv4()}.${getFileExtension(equipmentImageFile.name)}`;
                equipmentImageUrl = await uploadToFirebaseStorage(equipmentImageBuffer, equipmentImageFileName, equipmentImageFile.type);
            } catch (uploadError) {
                console.error('Error uploading equipment image:', uploadError);
                // Decide if this is a critical error or if you want to proceed without the image
            }
        }

        // --- 3. Prepare Data for Firestore ---
        const exerciseData = {
            name,
            equipment,
            sets,
            reps,
            rest,
            notes,
            exerciseImageUrl, // This will be the Firebase Storage URL or the directly provided URL
            equipmentImageUrl, // This will be the Firebase Storage URL or the directly provided URL
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // --- 4. Save to Firestore ---
        const exercisesCollection = adminDb.firestore().collection('exercises');
        const docRef = await exercisesCollection.add(exerciseData);

        return NextResponse.json({
            message: 'Exercise created successfully!',
            exerciseId: docRef.id,
            data: { ...exerciseData, id: docRef.id },
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating exercise:', error);
        if (error.message.includes("Unsupported event type")) { // FormData parsing error
            return NextResponse.json({ error: 'Failed to parse form data. Ensure you are sending multipart/form-data.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create exercise.', details: error.message }, { status: 500 });
    }
}

// You can also add GET, PUT, DELETE handlers in this file if needed.
// Example:
// export async function GET(req) {
//   // ... logic to fetch exercises
// }
