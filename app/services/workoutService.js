// services/workoutService.js
import { useStore } from '../store/store'; // Adjust path if needed

/**
 * Creates a new workout.
 * @param {object} workoutData - The workout data.
 * @param {string} workoutData.name - The name of the workout.
 * @param {string[]} workoutData.exerciseIds - An array of exercise IDs.
 * @returns {Promise<object|null>} The created workout data or null on failure.
 */
export const createWorkout = async (workoutData) => {
    const storeApi = useStore.getState();

    try {
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workoutData),
        });

        if (response.ok) {
            const result = await response.json();
            // result.data should contain { id, name, exerciseIds, createdAt, updatedAt }
            if (result.data) {
                storeApi.addWorkoutToList(result.data); // Add to the list of workouts
                storeApi.setWorkout(result.data);      // Set as the current workout
                return result.data;
            } else {
                console.error('Workout created, but no data returned in expected format:', result);
                throw new Error('Workout created, but response format was unexpected.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to create workout and parse error response.' }));
            console.error('Failed to create workout:', response.status, errorData);
            throw new Error(errorData.error || 'Failed to create workout.');
        }
    } catch (error) {
        console.error('Error creating workout:', error.message);
        // Potentially dispatch an error state to the store here
        return null;
    }
};

/**
 * Fetches a single workout by its ID.
 * @param {string} workoutId - The ID of the workout to fetch.
 * @returns {Promise<object|null>} The fetched workout data or null on failure.
 */
export const getWorkout = async (workoutId) => {
    const storeApi = useStore.getState();

    try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data) {
                storeApi.setWorkout(data); // Update the store with the fetched workout
                return data;
            } else {
                throw new Error('Workout data not found in response.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: `Failed to fetch workout ${workoutId} and parse error response.` }));
            console.error(`Failed to fetch workout ${workoutId}:`, response.status, errorData);
            throw new Error(errorData.error || `Failed to fetch workout ${workoutId}.`);
        }
    } catch (error) {
        console.error(`Error fetching workout ${workoutId}:`, error.message);
        // Potentially dispatch an error state to the store here
        return null;
    }
};

/**
 * Fetches all workouts.
 * @returns {Promise<object[]|null>} An array of workouts or null on failure.
 */
export const getWorkouts = async () => {
    const storeApi = useStore.getState();

    try {
        const response = await fetch('/api/workouts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.workouts) {
                storeApi.setWorkouts(data.workouts); // Update the store with all fetched workouts
                return data.workouts;
            } else {
                throw new Error('Workouts data not found in response.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to fetch workouts and parse error response.' }));
            console.error('Failed to fetch workouts:', response.status, errorData);
            throw new Error(errorData.error || 'Failed to fetch workouts.');
        }
    } catch (error) {
        console.error('Error fetching workouts:', error.message);
        // Potentially dispatch an error state to the store here
        return null;
    }
};

/**
 * Updates an existing workout.
 * @param {string} workoutId - The ID of the workout to update.
 * @param {object} updateData - The data to update (e.g., { name, exerciseIds }).
 * @returns {Promise<object|null>} The updated workout data or null on failure.
 */
export const updateWorkout = async (updateData) => {
    const storeApi = useStore.getState();

    try {
        const response = await fetch(`/api/workouts`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (response.ok) {
            const result = await response.json();
            // result.workout should contain the updated workout
            if (result.workout) {
                storeApi.updateWorkoutInList(result.workout); // Update in the list of workouts

                // If the updated workout is the current workout in store, update it
                const currentWorkout = storeApi.workout;
                if (currentWorkout && currentWorkout.id === updateData.workoutId) {
                    storeApi.setWorkout(result.workout);
                }
                return result.workout;
            } else {
                throw new Error('Updated workout data not found in response.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: `Failed to update workout ${updateData.workoutId} and parse error response.` }));
            console.error(`Failed to update workout ${updateData.workoutId}:`, response.status, errorData);
            throw new Error(errorData.error || `Failed to update workout ${updateData.workoutId}.`);
        }
    } catch (error) {
        console.error(`Error updating workout ${updateData.workoutId}:`, error.message);
        // Potentially dispatch an error state to the store here
        return null;
    }
};

/**
 * Deletes a workout by its ID.
 * @param {string} workoutId - The ID of the workout to delete.
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise.
 */
export const deleteWorkout = async (workoutId) => {
    const storeApi = useStore.getState();

    try {
        const response = await fetch(`/api/workouts`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workoutId),
        });

        if (response.ok) {
            // response.status === 200 for message, or 204 for no content
            storeApi.removeWorkoutFromList(workoutId); // Remove from the list of workouts

            // If the deleted workout is the current workout in store, clear it
            const currentWorkout = storeApi.workout;
            if (currentWorkout && currentWorkout.id === workoutId) {
                storeApi.clearWorkout();
            }
            return true;
        } else {
            const errorData = await response.json().catch(() => ({ error: `Failed to delete workout ${workoutId} and parse error response.` }));
            console.error(`Failed to delete workout ${workoutId}:`, response.status, errorData);
            throw new Error(errorData.error || `Failed to delete workout ${workoutId}.`);
        }
    } catch (error) {
        console.error(`Error deleting workout ${workoutId}:`, error.message);
        // Potentially dispatch an error state to the store here
        return false;
    }
};
