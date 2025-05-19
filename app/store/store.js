// store/store.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { postSlice } from './postSlice';
import {workoutSlice} from "@/app/store/workoutSlice";
import { createUserSlice } from './userSlice';

export const useStore = create(
    persist(
        (set, get) => ({
            ...postSlice(set, get),
            ...workoutSlice(set, get),
            ...createUserSlice(set, get),
            hasHydrated: false,
            setHasHydrated: (state) => set({ hasHydrated: state }),
        }),
        {
            name: 'olimpia3',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.log('An error occurred during hydration', error);
                } else {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);

export default useStore;




