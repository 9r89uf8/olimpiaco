// components/ExerciseList.js
import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state
import Alert from '@mui/material/Alert'; // For error or no data state

// Assuming ExerciseCard is in components/ExerciseCard.js
// If your ExerciseCard component is default exported from exercise_form_react_mui,
// the import path might be different based on your project structure.
// For this example, I'll assume it's accessible as:
import ExerciseCard from "@/app/components/exercise/card/ExerciseCard";

/**
 * ExerciseList component to display a list of exercises.
 *
 * @param {object} props - The properties for the component.
 * @param {Array} props.exercises - Array of exercise objects to display.
 * @param {boolean} [props.isLoading=false] - Optional flag to indicate if data is loading.
 * @param {object} [props.error=null] - Optional error object if fetching failed.
 */
function ExerciseList({ exercises, isLoading = false, error = null }) {
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading exercises...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                <Typography>Error loading exercises: {error.message || 'An unknown error occurred.'}</Typography>
            </Alert>
        );
    }

    if (!exercises || exercises.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                <Typography>No exercises found. Start by creating some!</Typography>
            </Alert>
        );
    }

    return (
        <Grid container spacing={3} sx={{ py: 2 }}>
            {exercises.map((exercise) => (
                <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                    {/*
            The ExerciseCard component is expected to be imported.
            Ensure the props passed to ExerciseCard match what it expects.
            The API route returns exercise objects with id, name, equipment, etc.
            The ExerciseCard from exercise_card_react_mui expects an 'exercise' prop
            which is an object containing these details.
          */}
                    <ExerciseCard exercise={exercise} />
                </Grid>
            ))}
        </Grid>
    );
}

export default ExerciseList;
