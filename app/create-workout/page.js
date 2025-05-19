// app/create-workout/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/app/store/store'; // Assuming your Zustand store
import { getExercises } from "@/app/services/postService"; // Your service to fetch exercises
import {createWorkout} from "@/app/services/workoutService";

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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete'; // Using Autocomplete for better UX

export default function CreateWorkoutPage() {
    const allExercises = useStore((state) => state.exercises);
    const isLoadingExercises = useStore((state) => state.isLoadingExercises);
    const exerciseError = useStore((state) => state.exerciseError);

    const [workoutName, setWorkoutName] = useState('');
    const [selectedExercises, setSelectedExercises] = useState([]); // Stores full exercise objects for display
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' }); // For success/error messages

    useEffect(() => {
            getExercises();
    }, []); // Re-fetch if exercises are empty or error changes

    const handleAddExerciseToWorkout = (exercise) => {
        if (exercise && !selectedExercises.find(ex => ex.id === exercise.id)) {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    const handleRemoveExerciseFromWorkout = (exerciseId) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
    };

    const handleSaveWorkout = async () => {
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

        try {
            await createWorkout({ name: workoutName, exerciseIds })

        } catch (error) {
            console.error("Error saving workout:", error);
            setSaveMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Create New Workout
            </Typography>

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
                        />
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Available Exercises</Typography>
                        {isLoadingExercises && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
                        )}
                        {exerciseError && (
                            <Alert severity="error" sx={{ my: 2 }}>Error loading exercises: {exerciseError.message || 'Unknown error'}</Alert>
                        )}
                        {!isLoadingExercises && !exerciseError && allExercises && (
                            <Autocomplete
                                multiple
                                id="select-exercises"
                                options={allExercises.filter(opt => !selectedExercises.find(sel => sel.id === opt.id))} // Show only unselected
                                getOptionLabel={(option) => option.name || 'Unnamed Exercise'}
                                value={selectedExercises} // This manages the selected values in the Autocomplete visually
                                onChange={(event, newValue) => {
                                    // Autocomplete's newValue is the complete list of selected items.
                                    // We directly set selectedExercises based on this.
                                    setSelectedExercises(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Select Exercises to Add"
                                        placeholder="Type to search exercises..."
                                    />
                                )}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.name} ({option.equipment || 'N/A'})
                                    </li>
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                sx={{ mb: 2 }}
                            />
                        )}
                        {!isLoadingExercises && !exerciseError && (!allExercises || allExercises.length === 0) && (
                            <Alert severity="info">No exercises available. Please create some exercises first.</Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Right Panel: Current Workout Composition */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: '20px' /* Adjust as needed for navbar height */ }}>
                        <Typography variant="h6" gutterBottom>
                            Current Workout: {workoutName || "(Unnamed Workout)"}
                        </Typography>
                        {selectedExercises.length === 0 ? (
                            <Typography color="text.secondary">No exercises added yet. Select from the list.</Typography>
                        ) : (
                            <List dense>
                                {selectedExercises.map((exercise, index) => (
                                    <ListItem
                                        key={exercise.id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveExerciseFromWorkout(exercise.id)}>
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
                                onClick={handleSaveWorkout}
                                disabled={isSaving || selectedExercises.length === 0 || !workoutName.trim()}
                                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            >
                                {isSaving ? 'Saving...' : 'Save Workout'}
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
