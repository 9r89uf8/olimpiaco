// components/ExerciseForm.js
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NotesIcon from '@mui/icons-material/Notes';
import ReplayIcon from '@mui/icons-material/Replay'; // For Sets
import RepeatIcon from '@mui/icons-material/Repeat'; // For Reps
import TimerIcon from '@mui/icons-material/Timer'; // For Rest
import SaveIcon from '@mui/icons-material/Save';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteIcon from '@mui/icons-material/Delete'; // For removing selected image
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // For upload button

/**
 * ExerciseForm component to create or edit exercise details.
 *
 * @param {object} props - The properties for the component.
 * @param {function} props.onSubmit - Function to call when the form is submitted.
 * It receives the exercise data object as an argument.
 * @param {object} [props.initialData] - Optional initial data for editing an existing exercise.
 * @param {string} [props.submitButtonText="Save Exercise"] - Text for the submit button.
 */
function ExerciseForm({ onSubmit, initialData, submitButtonText = "Save Exercise" }) {
    const [exerciseName, setExerciseName] = useState(initialData?.name || '');
    const [equipment, setEquipment] = useState(initialData?.equipment || '');
    const [sets, setSets] = useState(initialData?.sets || '');
    const [reps, setReps] = useState(initialData?.reps || '');
    const [rest, setRest] = useState(initialData?.rest || '');
    const [notes, setNotes] = useState(initialData?.notes || '');

    // State for image files and previews
    const [exerciseImageFile, setExerciseImageFile] = useState(null);
    const [equipmentImageFile, setEquipmentImageFile] = useState(null);
    const [exerciseImagePreview, setExerciseImagePreview] = useState(initialData?.exerciseImageUrl || '');
    const [equipmentImagePreview, setEquipmentImagePreview] = useState(initialData?.equipmentImageUrl || '');

    const [errors, setErrors] = useState({});

    // Effect to revoke object URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (exerciseImageFile && exerciseImagePreview && exerciseImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(exerciseImagePreview);
            }
            if (equipmentImageFile && equipmentImagePreview && equipmentImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(equipmentImagePreview);
            }
        };
    }, [exerciseImageFile, equipmentImageFile, exerciseImagePreview, equipmentImagePreview]);


    const validateForm = () => {
        const newErrors = {};
        if (!exerciseName.trim()) newErrors.exerciseName = "Exercise name is required.";
        if (!equipment.trim()) newErrors.equipment = "Equipment is required.";
        if (!sets.toString().trim()) newErrors.sets = "Sets are required."; // Ensure sets can be numbers
        if (!reps.toString().trim()) newErrors.reps = "Reps are required."; // Ensure reps can be numbers
        // No validation for image files here, but could be added (e.g., file type, size)
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();


        const formData = new FormData();
        formData.append('name', exerciseName);
        formData.append('equipment', equipment);
        formData.append('sets', sets);
        formData.append('reps', reps);
        formData.append('rest', rest);
        formData.append('notes', notes);

        formData.append('exerciseImageFile', exerciseImageFile);
        formData.append('equipmentImageFile', equipmentImageFile);

        onSubmit(formData);
        if (!initialData) {
            handleClearForm();
        }
    };

    const handleClearForm = () => {
        setExerciseName('');
        setEquipment('');
        setSets('');
        setReps('');
        setRest('');
        setNotes('');

        if (exerciseImagePreview && exerciseImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(exerciseImagePreview);
        }
        setExerciseImageFile(null);
        setExerciseImagePreview('');

        if (equipmentImagePreview && equipmentImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(equipmentImagePreview);
        }
        setEquipmentImageFile(null);
        setEquipmentImagePreview('');
        setErrors({});
    };

    const handleImageChange = (event, setImageFile, setImagePreview, currentPreview) => {
        const file = event.target.files[0];
        if (file) {
            // Revoke old blob URL if one exists from a previous selection in this session
            if (currentPreview && currentPreview.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreview);
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = (setImageFile, setImagePreview, currentPreview, fieldName) => {
        if (currentPreview && currentPreview.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreview);
        }
        setImageFile(null);
        setImagePreview(''); // Clears the preview
        // If there was an initialData URL for this image, it means we are "removing" it in the context of the form.
        // The parent component's onSubmit will need to handle this (e.g., by sending a null for this image field).
        // For simplicity, we just clear it on the frontend.
        if (fieldName === 'exercise' && initialData?.exerciseImageUrl) {
            // Optionally, you could set a flag to indicate removal of existing image
        }
        if (fieldName === 'equipment' && initialData?.equipmentImageUrl) {
            // Optionally, you could set a flag
        }
    };


    return (
        <Paper elevation={3} sx={{ padding: { xs: 2, sm: 3, md: 4 }, margin: 2, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                {initialData ? 'Edit Exercise' : 'Create New Exercise'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                <Grid container spacing={3}>
                    {/* Exercise Name */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Exercise Name"
                            variant="outlined"
                            value={exerciseName}
                            onChange={(e) => setExerciseName(e.target.value)}
                            required
                            error={!!errors.exerciseName}
                            helperText={errors.exerciseName}
                        />
                    </Grid>

                    {/* Equipment */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Equipment Used"
                            variant="outlined"
                            value={equipment}
                            onChange={(e) => setEquipment(e.target.value)}
                            required
                            error={!!errors.equipment}
                            helperText={errors.equipment}
                            InputProps={{
                                startAdornment: <FitnessCenterIcon position="start" sx={{mr:1, color: 'action.active'}} />,
                            }}
                        />
                    </Grid>

                    {/* Sets, Reps, Rest */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Sets"
                            variant="outlined"
                            type="number" // Good for numeric input
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                            required
                            error={!!errors.sets}
                            helperText={errors.sets}
                            InputProps={{
                                startAdornment: <ReplayIcon position="start" sx={{mr:1, color: 'action.active'}} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Reps"
                            variant="outlined"
                            type="number" // Good for numeric input
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            required
                            error={!!errors.reps}
                            helperText={errors.reps}
                            InputProps={{
                                startAdornment: <RepeatIcon position="start" sx={{mr:1, color: 'action.active'}} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Rest (e.g., 60s)"
                            variant="outlined"
                            value={rest}
                            onChange={(e) => setRest(e.target.value)}
                            InputProps={{
                                startAdornment: <TimerIcon position="start" sx={{mr:1, color: 'action.active'}} />,
                            }}
                        />
                    </Grid>

                    {/* Exercise Image Upload */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" gutterBottom>Exercise Image</Typography>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="exercise-image-upload"
                            type="file"
                            onChange={(e) => handleImageChange(e, setExerciseImageFile, setExerciseImagePreview, exerciseImagePreview)}
                        />
                        <label htmlFor="exercise-image-upload">
                            <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} sx={{ mb: 1 }}>
                                Upload Image
                            </Button>
                        </label>
                        {exerciseImagePreview && (
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={exerciseImagePreview}
                                    alt="Exercise Preview"
                                    style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => removeImage(setExerciseImageFile, setExerciseImagePreview, exerciseImagePreview, 'exercise')}
                                    startIcon={<DeleteIcon />}
                                    sx={{mt: 0.5}}
                                >
                                    Remove
                                </Button>
                            </Box>
                        )}
                        {!exerciseImagePreview && <Typography variant="body2" color="text.secondary" sx={{ml:1}}><AddPhotoAlternateIcon sx={{verticalAlign: 'bottom', mr: 0.5}}/> No image selected</Typography>}
                    </Grid>

                    {/* Equipment Image Upload */}
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" gutterBottom>Equipment Image</Typography>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="equipment-image-upload"
                            type="file"
                            onChange={(e) => handleImageChange(e, setEquipmentImageFile, setEquipmentImagePreview, equipmentImagePreview)}
                        />
                        <label htmlFor="equipment-image-upload">
                            <Button variant="contained" component="span" startIcon={<CloudUploadIcon />} sx={{ mb: 1 }}>
                                Upload Image
                            </Button>
                        </label>
                        {equipmentImagePreview && (
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={equipmentImagePreview}
                                    alt="Equipment Preview"
                                    style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => removeImage(setEquipmentImageFile, setEquipmentImagePreview, equipmentImagePreview, 'equipment')}
                                    startIcon={<DeleteIcon />}
                                    sx={{mt: 0.5}}
                                >
                                    Remove
                                </Button>
                            </Box>
                        )}
                        {!equipmentImagePreview && <Typography variant="body2" color="text.secondary" sx={{ml:1}}><AddPhotoAlternateIcon sx={{verticalAlign: 'bottom', mr: 0.5}}/> No image selected</Typography>}
                    </Grid>


                    {/* Notes */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes / Instructions"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            InputProps={{
                                startAdornment: <NotesIcon position="start" sx={{mr:1, mt: 1.5, alignSelf: 'flex-start', color: 'action.active'}} />,
                            }}
                        />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleClearForm}
                                startIcon={<ClearAllIcon />}
                                disabled={
                                    !exerciseName && !equipment && !sets && !reps && !rest && !notes &&
                                    !exerciseImageFile && !equipmentImageFile &&
                                    (!initialData || (!initialData.exerciseImageUrl && !initialData.equipmentImageUrl)) // More robust check for disabling clear
                                }
                            >
                                Clear Form
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                            >
                                {submitButtonText}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
}

export default ExerciseForm;
