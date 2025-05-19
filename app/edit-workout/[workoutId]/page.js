// app/edit-workout/[workoutId]/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams to get workoutId
import { useStore } from '@/app/store/store';
import { getExercises } from "@/app/services/postService"; // Your service to fetch all exercises
import { getWorkout, updateWorkout } from "@/app/services/workoutService"; // Services for specific workout

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';

// MUI Icons
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SaveIcon from '@mui/icons-material/Save'; // Or UpdateIcon
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditWorkoutPage() {
    const router = useRouter();
    const params = useParams(); // Get route parameters
    const workoutId = params?.workoutId; // Extract workoutId

    // Zustand store selectors
    const allExercises = useStore((state) => state.exercises);
    const setAllExercises = useStore((state) => state.setExercises); // Action to set exercises
    const isLoadingAllExercises = useStore((state) => state.isLoadingExercises);
    const setLoadingAllExercises = useStore((state) => state.setIsLoadingExercises); // Action
    const allExercisesError = useStore((state) => state.exerciseError);
    const setAllExercisesError = useStore((state) => state.setExerciseError); // Action

    // Component state
    const [workoutName, setWorkoutName] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]); // Stores full exercise objects
    const [initialWorkoutData, setInitialWorkoutData] = useState(null); // To store fetched workout
    const [isLoadingWorkout, setIsLoadingWorkout] = useState(true); // Loading state for the specific workout
    const [workoutError, setWorkoutError] = useState(null); // Error state for the specific workout
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    // Fetch all exercises (similar to create page)
    useEffect(() => {
        const fetchAllExercises = async () => {
            if (!allExercises || allExercises.length === 0) { // Fetch only if not already in store
                setLoadingAllExercises(true);
                try {
                    const exercisesData = await getExercises(); // Assuming getExercises updates the store or returns data
                    if (exercisesData) { // If getExercises returns data directly
                        setAllExercises(exercisesData); // Update store if service doesn't
                    }
                } catch (error) {
                    console.error("Failed to fetch all exercises:", error);
                    setAllExercisesError(error);
                } finally {
                    setLoadingAllExercises(false);
                }
            } else {
                setLoadingAllExercises(false); // Already loaded
            }
        };
        fetchAllExercises();
    }, [allExercises, setAllExercises, setLoadingAllExercises, setAllExercisesError]);


    // Fetch the specific workout to edit
    const fetchWorkoutToEdit = useCallback(async () => {
        if (!workoutId) {
            setWorkoutError({ message: "Workout ID is missing." });
            setIsLoadingWorkout(false);
            return;
        }
        if (!allExercises || allExercises.length === 0) {
            // Wait for allExercises to be loaded before attempting to map IDs
            // This effect will re-run when allExercises changes
            return;
        }

        setIsLoadingWorkout(true);
        setWorkoutError(null);
        try {
            const fetchedWorkout = await getWorkout(workoutId); // This service should update store or return data
            if (fetchedWorkout) {
                const workoutData = fetchedWorkout;
                setInitialWorkoutData(workoutData);
                setWorkoutName(workoutData.name || '');

                // Map exercise IDs to full exercise objects
                const populatedExercises = workoutData.exerciseIds
                    .map(id => allExercises.find(ex => ex.id === id))
                    .filter(ex => ex); // Filter out any undefined if an ID doesn't match

                setSelectedExercises(populatedExercises);

            } else {
                setWorkoutError({ message: `Workout with ID ${workoutId} not found.` });
            }
        } catch (error) {
            console.error(`Error fetching workout ${workoutId}:`, error);
            setWorkoutError(error);
        } finally {
            setIsLoadingWorkout(false);
        }
    }, [workoutId, allExercises]); // Add allExercises as a dependency

    useEffect(() => {
        fetchWorkoutToEdit();
    }, [fetchWorkoutToEdit]); // fetchWorkoutToEdit is memoized with useCallback

    // Handler to update selected exercises in the Autocomplete
    // This is slightly different from create page as Autocomplete's `value` is `selectedExercises`
    const handleSelectedExercisesChange = (event, newValue) => {
        setSelectedExercises(newValue);
    };

    // Handler to remove an exercise from the "Current Workout" list (visual only, Autocomplete handles the source)
    const handleRemoveExerciseFromList = (exerciseId) => {
        setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    };


    const handleUpdateWorkout = async () => {
        if (!workoutName.trim()) {
            setSaveMessage({ type: 'error', text: 'Workout name is required.' });
            return;
        }
        if (selectedExercises.length === 0) {
            setSaveMessage({ type: 'error', text: 'Please add at least one exercise to the workout.' });
            return;
        }

        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        const exerciseIds = selectedExercises.map(ex => ex.id);
        const updateData = { name: workoutName.trim(), exerciseIds, workoutId: workoutId };

        try {
            const updatedWorkout = await updateWorkout(updateData);
            console.log('update')
            console.log(updatedWorkout);
            if (updatedWorkout) {
                setSaveMessage({ type: 'success', text: 'Workout updated successfully!' });
                // Optionally, navigate away or refresh data
                // router.push('/workouts'); // Or back to the workout list
                // Or update initialWorkoutData to reflect changes if staying on page
                setInitialWorkoutData(updatedWorkout); // Reflects the saved state
            } else {
                setSaveMessage({ type: 'error', text: 'Failed to update workout. Please try again.' });
            }
        } catch (error) {
            console.error("Error updating workout:", error);
            setSaveMessage({ type: 'error', text: error.message || 'An unexpected error occurred while saving.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Main loading state for the page (waiting for workout data or all exercises)
    if (isLoadingAllExercises || isLoadingWorkout) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2 }}>Loading workout data...</Typography>
            </Container>
        );
    }

    // Error state if workout fetching failed
    if (workoutError) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading workout: {workoutError.message || 'Unknown error'}
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Go Back
                </Button>
            </Container>
        );
    }
    // Error state if all exercises fetching failed
    if (allExercisesError && (!allExercises || allExercises.length === 0)) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading exercises: {allExercisesError.message || 'Could not load essential exercise data.'}
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Go Back
                </Button>
            </Container>
        );
    }


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => router.back()} aria-label="go back" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Edit Workout
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Panel: Workout Details & Available Exercises */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Workout Details</Typography>
                        <TextField
                            fullWidth
                            label="Workout Name"
                            variant="outlined"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                            InputLabelProps={{ shrink: !!workoutName || isLoadingWorkout }} // Ensure label shrinks if value is pre-filled
                        />
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Available Exercises</Typography>
                        {/* Autocomplete for selecting exercises */}
                        <Autocomplete
                            multiple
                            id="edit-select-exercises"
                            options={allExercises || []} // Ensure options is always an array
                            // Disable options that are already selected
                            getOptionDisabled={(option) =>
                                selectedExercises.some(selected => selected.id === option.id)
                            }
                            getOptionLabel={(option) => option.name || 'Unnamed Exercise'}
                            value={selectedExercises} // Controls the selected items
                            onChange={handleSelectedExercisesChange} // Use the new handler
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Add or Remove Exercises"
                                    placeholder="Type to search exercises..."
                                />
                            )}
                            renderOption={(props, option, { selected }) => (
                                // `selected` in renderOption is for visual indication during dropdown interaction
                                // The actual selection is managed by `value` and `onChange`
                                <li {...props}>
                                    <Checkbox
                                        style={{ marginRight: 8 }}
                                        checked={selectedExercises.some(selEx => selEx.id === option.id)}
                                    />
                                    {option.name} ({option.equipment || 'N/A'})
                                </li>
                            )}
                            sx={{ mb: 2 }}
                            disabled={isLoadingAllExercises || !allExercises}
                        />
                        {(!allExercises || allExercises.length === 0) && !isLoadingAllExercises && !allExercisesError && (
                            <Alert severity="info">No exercises available in the system.</Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Right Panel: Current Workout Composition */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: '20px' }}>
                        <Typography variant="h6" gutterBottom>
                            Current Workout: {workoutName || "(Unnamed Workout)"}
                        </Typography>
                        {selectedExercises.length === 0 ? (
                            <Typography color="text.secondary">No exercises added. Select from the list.</Typography>
                        ) : (
                            <List dense>
                                {selectedExercises.map((exercise, index) => (
                                    <ListItem
                                        key={exercise.id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveExerciseFromList(exercise.id)}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        }
                                        sx={{ borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${exercise.name}`}
                                            secondary={exercise.equipment || 'No specific equipment'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdateWorkout}
                                disabled={isSaving || selectedExercises.length === 0 || !workoutName.trim()}
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                        {saveMessage.text && (
                            <Alert severity={saveMessage.type || 'info'} sx={{ mt: 2 }}>
                                {saveMessage.text}
                            </Alert>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
