// components/workout/WorkoutList.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton'; // Added for icon buttons
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit'; // Added for Edit button
import DeleteIcon from '@mui/icons-material/Delete'; // Added for Delete button
import Tooltip from '@mui/material/Tooltip'; // Added for tooltips on icon buttons

// Import the deleteWorkout service function
// updateWorkout is imported but not used in this specific update, will be used for the edit page later
import { deleteWorkout } from "@/app/services/workoutService";
// No need to import useStore here if service handles store updates directly

/**
 * WorkoutList component to display a list of workouts with an elegant and centered design.
 *
 * @param {object} props - The properties for the component.
 * @param {Array} props.workouts - Array of workout objects to display.
 * @param {boolean} [props.isLoading=false] - Flag to indicate if data is loading.
 * @param {object} [props.error=null] - Error object if fetching failed.
 */
function WorkoutList({ workouts, isLoading = false, error = null }) {
    const router = useRouter();

    // Handles navigation to the specific workout page
    const handleStartWorkout = (workoutId) => {
        if (workoutId) {
            router.push(`/workout/${workoutId}`);
        }
    };

    // Handles navigation to the edit workout page
    const handleEditWorkout = (workoutId) => {
        if (workoutId) {
            // Later, this will navigate to a dedicated edit page
            // For now, you can add a console log or a simple alert
            console.log(`Navigate to edit page for workout: ${workoutId}`);
            router.push(`/edit-workout/${workoutId}`); // Assuming this route will exist
        }
    };

    // Handles deleting a workout
    const handleDeleteWorkout = async (workoutId) => {
        if (workoutId) {
            // Optional: Add a confirmation dialog here
            // e.g., if (window.confirm('Are you sure you want to delete this workout?')) { ... }
            try {
                const success = await deleteWorkout(workoutId);
            } catch (err) {
                console.error('Error during workout deletion:', err);
                alert('An error occurred while deleting the workout.');
            }
        }
    };


    // --- Loading State ---
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 200px)',
                    py: 5,
                    color: 'text.secondary',
                    textAlign: 'center',
                }}
            >
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" component="p">Loading your workouts...</Typography>
                <Typography variant="body2">Please wait a moment.</Typography>
            </Box>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 200px)',
                    py: 3,
                    px: 2,
                }}
            >
                <Alert
                    severity="error"
                    iconMapping={{
                        error: <ErrorOutlineIcon sx={{ fontSize: '2.5rem', mr: 1 }} />,
                    }}
                    sx={{
                        p: 3,
                        borderRadius: '12px',
                        width: { xs: '100%', sm: 'auto' },
                        maxWidth: '500px',
                        textAlign: 'center',
                        boxShadow: 3,
                        '.MuiAlert-message': {
                            width: '100%'
                        }
                    }}
                >
                    <Typography variant="h6" component="p" fontWeight="medium" gutterBottom>
                        Oops! Something Went Wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {error.message || 'We couldn\'t load your workouts. Please try again later.'}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // --- Empty State ---
    if (!workouts || workouts.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - 200px)',
                    py: 3,
                    px: 2,
                }}
            >
                <Alert
                    severity="info"
                    iconMapping={{
                        info: <InfoOutlinedIcon sx={{ fontSize: '3rem', mr: 1 }} />,
                    }}
                    sx={{
                        p: {xs: 2, sm: 3},
                        borderRadius: '12px',
                        width: { xs: '100%', sm: 'auto' },
                        maxWidth: '550px',
                        textAlign: 'center',
                        boxShadow: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        '.MuiAlert-icon': {
                            mb: 1.5,
                        }
                    }}
                >
                    <Typography variant="h5" component="p" fontWeight="medium" sx={{ mb: 1.5 }}>
                        Your Workout Slate is Clean!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
                        Ready to sculpt your fitness journey? Let's add your first routine.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => router.push('/create-workout')}
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ borderRadius: '8px', px: 3, py: 1.25 }}
                    >
                        Create First Workout
                    </Button>
                </Alert>
            </Box>
        );
    }

    // --- Workout Cards Display ---
    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ py: {xs: 2, md: 3} }}>
            {workouts.map((workout) => (
                <Grid item xs={12} sm={6} md={4} key={workout.id}>
                    <Card
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                            transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px) scale(1.01)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                            },
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <FitnessCenterIcon
                                    sx={{
                                        mr: 1.5,
                                        fontSize: '2.25rem',
                                        color: 'primary.main',
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{ fontWeight: '600' }}
                                >
                                    {workout.name || 'Unnamed Workout'}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    mb: 2.5,
                                    minHeight: '48px',
                                    lineHeight: 1.6,
                                }}
                            >
                                {workout.description || (workout.exerciseIds && workout.exerciseIds.length > 0
                                    ? `${workout.exerciseIds.length} exercise${workout.exerciseIds.length === 1 ? '' : 's'}`
                                    : 'No specific details. Ready to start?')}
                            </Typography>
                        </CardContent>

                        <CardActions
                            sx={{
                                p: 2,
                                pt: 1,
                                justifyContent: 'space-between', // Changed to space-between
                                alignItems: 'center', // Align items vertically
                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                                flexWrap: 'wrap', // Allow actions to wrap on smaller screens
                                gap: 1, // Add gap between action items
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                size="medium" // Adjusted size for better fit with other buttons
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleStartWorkout(workout.id)}
                                disabled={!workout.id}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'medium',
                                    borderRadius: '8px',
                                    px: 3, // Adjusted padding
                                    // py: 1, // Adjusted padding
                                    flexGrow: { xs: 1, sm: 0 }, // Allow start button to grow on xs screens
                                    minWidth: {xs: 'calc(50% - 4px)', sm: 'auto'} // Ensure it takes good space on xs
                                }}
                            >
                                Start
                            </Button>
                            <Box sx={{ display: 'flex', gap: 1 }}> {/* Group Edit and Delete buttons */}
                                <Tooltip title="Edit Workout">
                                    <IconButton
                                        aria-label="edit workout"
                                        onClick={() => handleEditWorkout(workout.id)}
                                        color="secondary" // Or "default" or "primary"
                                        size="medium" // Matched size
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Workout">
                                    <IconButton
                                        aria-label="delete workout"
                                        onClick={() => handleDeleteWorkout(workout.id)}
                                        color="error" // Use error color for delete
                                        size="medium" // Matched size
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default WorkoutList;

