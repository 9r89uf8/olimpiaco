// app/workout/[workoutId]/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For accessing route params and navigation
import {getWorkout} from "@/app/services/workoutService";
import { useStore } from '@/app/store/store';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import MobileStepper from '@mui/material/MobileStepper'; // Good for mobile views
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';

// Assuming ExerciseCard is in components/ExerciseCard.js
// Adjust path if necessary.
import ExerciseCard from "@/app/components/exercise/card/ExerciseCard";

export default function PerformWorkoutPage() {
    const params = useParams(); // Gets { workoutId: 'value' }
    const router = useRouter(); // For navigation, e.g., back to workouts list
    const workoutId = params?.id;
    const workout = useStore((state) => state.workout);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const fetchWorkout = useCallback(async () => {
        if (!workoutId) {
            setError({ message: 'Workout ID not found in URL.' });
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await getWorkout(workoutId);
        } catch (err) {
            console.error("Fetch workout error:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [workoutId]);

    useEffect(() => {
        fetchWorkout();
    }, [fetchWorkout]);

    const handleNext = () => {
        if (workout && currentExerciseIndex < workout.exercises.length - 1) {
            setCurrentExerciseIndex(prevIndex => prevIndex + 1);
        } else if (workout && currentExerciseIndex === workout.exercises.length - 1) {
            setIsCompleted(true);
        }
    };

    const handleBack = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prevIndex => prevIndex - 1);
            setIsCompleted(false); // If they go back, it's not completed anymore
        }
    };

    const handleRestart = () => {
        setCurrentExerciseIndex(0);
        setIsCompleted(false);
        // Optionally re-fetch if data could have changed, but usually not needed for restart
    }

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading workout...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography gutterBottom>Error: {error.message}</Typography>
                    <Button variant="outlined" onClick={() => router.push('/')}>Go Home</Button>
                </Alert>
            </Container>
        );
    }

    if (!workout) {
        // Should be caught by error handling, but as a fallback
        return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="info">Workout data not available.</Alert></Container>;
    }

    const currentExercise = workout.exercises && workout.exercises.length > 0 ? workout.exercises[currentExerciseIndex] : null;
    const totalExercises = workout.exercises ? workout.exercises.length : 0;

    return (
        <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
                    {workout.name || 'Workout Session'}
                </Typography>
                {totalExercises > 0 && !isCompleted && (
                    <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2 }}>
                        Exercise {currentExerciseIndex + 1} of {totalExercises}
                    </Typography>
                )}
            </Paper>

            {isCompleted ? (
                <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>Workout Completed!</Typography>
                    <Typography sx={{ mb: 3 }}>Great job finishing all exercises.</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={handleRestart} startIcon={<ReplayIcon />}>
                            Restart Workout
                        </Button>
                        <Button variant="contained" onClick={() => router.push('/')}> {/* Or to a workouts list page */}
                            Back to Home
                        </Button>
                    </Box>
                </Paper>
            ) : currentExercise ? (
                <>
                    {/* Desktop Stepper (optional, good for wider screens) */}
                    {totalExercises > 1 && (
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '100%', mb: 3 }}>
                            <Stepper activeStep={currentExerciseIndex} alternativeLabel>
                                {workout.exercises.map((ex, index) => (
                                    <Step key={ex.id || index}>
                                        <StepLabel sx={{fontSize: '0.8rem'}}>{ex.name.length > 15 ? ex.name.substring(0,12) + '...' : ex.name}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    )}

                    {/* Navigation Buttons */}
                    <MobileStepper
                        variant="dots" // "dots", "text", "progress"
                        steps={totalExercises}
                        position="static"
                        activeStep={currentExerciseIndex}
                        sx={{ maxWidth: 400, flexGrow: 1, margin: '20px auto', backgroundColor: 'transparent' }}
                        nextButton={
                            <Button
                                size="large"
                                onClick={handleNext}
                                disabled={currentExerciseIndex === totalExercises -1 && isCompleted /* Already completed or last step */}
                                sx={{px:3}}
                            >
                                {currentExerciseIndex === totalExercises - 1 ? 'Finish' : 'Next'}
                                <KeyboardArrowRight />
                            </Button>
                        }
                        backButton={
                            <Button
                                size="large"
                                onClick={handleBack}
                                disabled={currentExerciseIndex === 0}
                                sx={{px:3}}
                            >
                                <KeyboardArrowLeft />
                                Back
                            </Button>
                        }
                    />

                    <ExerciseCard exercise={currentExercise} />
                </>
            ) : (
                <Alert severity="info" sx={{mt: 2}}>
                    This workout currently has no exercises assigned or there was an issue loading them.
                </Alert>
            )}
        </Container>
    );
}
