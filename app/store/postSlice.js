//store/postSlice
export const postSlice = (set) => ({
    exercises: [],

    setExercises: (exercises) => set({ exercises: exercises }),

    clearExercises: () => set({ exercises: [] })
});
