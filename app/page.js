// app/page.jsx
'use client';

import { useEffect } from 'react';
import { useStore } from '@/app/store/store';
import { getWorkouts } from "@/app/services/workoutService";
import { Container, Typography, Box, Button, Paper } from '@mui/material'; // Added Paper for elevation options
import { useRouter } from 'next/navigation';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Icon for Create button

import WorkoutList from "@/app/components/workout/WorkoutList";

export default function Home() {
    const router = useRouter();
    const user = useStore((state) => state.user); // Assuming user info might be used for personalization later
    const workouts = useStore((state) => state.workouts);
    const isLoadingWorkouts = useStore((state) => state.isLoadingWorkouts);
    const workoutError = useStore((state) => state.workoutError);

    useEffect(() => {
        const initializeData = async () => {
            if ((!workouts || workouts.length === 0) && !isLoadingWorkouts) {
                await getWorkouts();
            }
        };
        initializeData();
    }, [workouts, isLoadingWorkouts]); // Removed getWorkouts from dependency array if it's stable

    return (
        <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}> {/* Added more top margin */}
            <Paper
                elevation={0} // No shadow, just using for potential background or padding
                sx={{
                    p: { xs: 2, md: 3 }, // Responsive padding
                    mb: 4,
                    // Example of adding a subtle background if desired, or keep it transparent
                    // background: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                    // borderRadius: 2, // Optional: if you want this section to have rounded corners
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens
                    gap: 2, // Adds space between items when stacked
                }}>
                    <Typography
                        variant="h4" // Made title larger
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: 'text.primary', // Ensure good contrast
                            textAlign: { xs: 'center', md: 'left' }, // Center on small screens
                        }}
                    >
                        Your Workout Routines
                    </Typography>
                    <Button
                        variant="contained"
                        // Using a vibrant color - 'secondary' or a custom one
                        // For example, if your theme's secondary isn't punchy enough:
                        // color="success" or sx={{ bgcolor: 'yourPreferredColor', '&:hover': { bgcolor: 'darkerVersion'}}}
                        color="secondary" // Assuming 'secondary' is a nice contrast or vibrant color in your theme
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => router.push('/create-workout')}
                        sx={{
                            py: 1.5, // Taller button
                            px: 3,    // Wider button
                            fontWeight: 'medium',
                            borderRadius: '8px', // Softer corners
                            textTransform: 'none', // More casual text
                            fontSize: '1rem',
                            width: { xs: '100%', md: 'auto' } // Full width on small screens
                        }}
                    >
                        Create New Workout
                    </Button>
                </Box>
            </Paper>

            <WorkoutList
                workouts={workouts}
                isLoading={isLoadingWorkouts}
                error={workoutError}
            />
        </Container>
    );
}
