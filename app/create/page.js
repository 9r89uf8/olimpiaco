'use client'
import ExerciseForm from '@/app/components/exercise/create/ExerciseForm';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import {saveExercise} from "@/app/services/postService";

const theme = createTheme(); // Default MUI theme or your custom theme

export default function CreateExercisePage() {


    const handleCreateExercise = async (exerciseData) => {
        await saveExercise(exerciseData);
    }

  // Example for editing:
  // const sampleExistingExercise = {
  //   name: "Dumbbell Bench Press",
  //   equipment: "2 x 40lb Dumbbells",
  //   sets: "3-4",
  //   reps: "6-12",
  //   rest: "60-90 seconds",
  //   notes: "Lie on the floor or a sturdy bench. Focus on controlled movement.",
  //   exerciseImageUrl: "https://placehold.co/450x200/E0E0E0/757575?text=Bench+Press",
  //   equipmentImageUrl: "https://placehold.co/50x50/E0E0E0/757575?text=Dumbbell"
  // };
  // const handleUpdateExercise = (exerciseData) => {
  //   console.log("Updated Exercise Data:", exerciseData);
  //   // API call to update
  //   alert('Exercise data updated! Check the console.');
  // };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ExerciseForm onSubmit={handleCreateExercise} />
        {/* Example for an edit form: */}
        {/* <Typography variant="h4" sx={{mt: 5, mb: 2}}>Edit Existing Exercise</Typography> */}
        {/* <ExerciseForm
            onSubmit={handleUpdateExercise}
            initialData={sampleExistingExercise}
            submitButtonText="Update Exercise"
        /> */}
      </Container>
    </ThemeProvider>
  );
}

