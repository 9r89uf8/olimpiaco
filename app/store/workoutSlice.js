// store/workoutSlice.js

export const workoutSlice = (set, get) => ({
    workouts: [], // Array to store multiple workouts
    workout: null,  // Object to store a single selected/viewed workout

    /**
     * Replaces the entire list of workouts.
     * @param {object[]} workouts - An array of workout objects.
     */
    setWorkouts: (workouts) => set({ workouts: workouts }),

    /**
     * Sets the currently active/selected workout.
     * @param {object | null} workout - A workout object or null.
     */
    setWorkout: (workout) => set({ workout: workout }),

    /**
     * Adds a new workout to the beginning of the workouts list.
     * @param {object} newWorkout - The workout object to add.
     */
    addWorkoutToList: (newWorkout) => set((state) => ({
        workouts: [newWorkout, ...state.workouts.filter(w => w.id !== newWorkout.id)] // Add to beginning, prevent duplicates by ID
    })),

    /**
     * Updates an existing workout in the workouts list.
     * If the workout is not found, the list remains unchanged.
     * @param {object} updatedWorkout - The workout object with updated data. It must have an 'id'.
     */
    updateWorkoutInList: (updatedWorkout) => set((state) => ({
        workouts: state.workouts.map(w =>
            w.id === updatedWorkout.id ? { ...w, ...updatedWorkout } : w
        ),
    })),

    /**
     * Removes a workout from the workouts list by its ID.
     * @param {string} workoutId - The ID of the workout to remove.
     */
    removeWorkoutFromList: (workoutId) => set((state) => ({
        workouts: state.workouts.filter(w => w.id !== workoutId),
    })),

    /**
     * Clears the list of workouts.
     */
    clearWorkouts: () => set({ workouts: [] }),

    /**
     * Clears the currently active/selected workout.
     */
    clearWorkout: () => set({ workout: null }),

    // --- Example of a selector (optional, can also be done in components) ---
    /**
     * Gets a workout by its ID from the current list of workouts.
     * @param {string} workoutId - The ID of the workout to find.
     * @returns {object | undefined} The workout object if found, otherwise undefined.
     */
    getWorkoutById: (workoutId) => {
        return get().workouts.find(w => w.id === workoutId);
    }
});
