// services/conversationService.js
import { useStore } from '../store/store'; // Adjust path if needed

export const saveExercise = async (formData) => {

    try {

        const response = await fetch('/api/exercise/create', {
            method: 'POST',
            body: formData, // Send formData directly
        });
        if (response.ok) {
            const data = await response.json();
            return data.assistantMessage;
        } else {
            throw new Error('Failed to send chat prompt');
        }
    } catch (error) {
        console.error('Error sending chat prompt:', error.message);
        return null;
    }
};

export const getExercises = async (formData) => {

    try {
        const addExercises = useStore.getState().setExercises;
        const response = await fetch('/api/exercise/all', {
            method: 'GET'
        });
        if (response.ok) {
            const data = await response.json();
            addExercises(data.exercises);
            return data
        } else {
            throw new Error('Failed to send chat prompt');
        }
    } catch (error) {
        console.error('Error sending chat prompt:', error.message);
        return null;
    }
};


