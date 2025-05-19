// components/ExerciseCard.js
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider'; // For visual separation

// Icons
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NotesIcon from '@mui/icons-material/Notes';
import ReplayIcon from '@mui/icons-material/Replay'; // For Sets
import RepeatIcon from '@mui/icons-material/Repeat'; // For Reps
import TimerIcon from '@mui/icons-material/Timer'; // For Rest

// Placeholder image function
const placeholderImage = (text, width = 600, height = 400, bgColor = 'E0E0E0', textColor = '757575') =>
    `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}&font=montserrat`;

/**
 * MetricItem: A sub-component to display individual metrics like Sets, Reps, Rest.
 */
const MetricItem = ({ icon, label, value, color = 'text.secondary' }) => (
    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1 }}>
        {React.cloneElement(icon, { sx: { fontSize: '2.25rem', mb: 0.5, color: color } })} {/* Larger Icon */}
        <Typography variant="overline" display="block" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: 'text.secondary', fontSize: '0.7rem' }}>
            {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', fontSize: '1.5rem' }}> {/* Larger Value */}
            {value || 'N/A'}
        </Typography>
    </Box>
);

/**
 * ExerciseCard component to display exercise details with an elegant layout.
 */
function ExerciseCard({ exercise }) {
    if (!exercise) {
        return <Typography sx={{ p: 2, textAlign: 'center' }}>No exercise data provided.</Typography>;
    }

    const {
        name,
        equipment,
        sets,
        reps,
        rest,
        notes,
        exerciseImageUrl,
        equipmentImageUrl,
    } = exercise;

    return (
        <Card sx={{ maxWidth: 500, margin: 'auto', my: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Exercise Image */}
            <CardMedia
                component="img"
                height="250" // Slightly taller image
                image={exerciseImageUrl || placeholderImage(name || 'Exercise', 600, 375, 'cccccc', '555555')}
                alt={name || 'Exercise Image'}
            />
            <CardContent sx={{ p: 3 }}> {/* Increased padding */}
                {/* Exercise Name */}
                <Typography
                    gutterBottom
                    variant="h4" // Larger font for name
                    component="div"
                    sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2.5, color: 'text.primary' }}
                >
                    {name || 'Unnamed Exercise'}
                </Typography>

                {/* Sets, Reps, Rest Section - Arranged Horizontally */}
                <Grid container spacing={1} justifyContent="space-around" sx={{ mb: 3, textAlign: 'center' }}>
                    <Grid item xs={4}>
                        <MetricItem icon={<ReplayIcon />} label="SETS" value={sets} color="primary.main" />
                    </Grid>
                    <Grid item xs={4}>
                        <MetricItem icon={<RepeatIcon />} label="REPS" value={reps} color="primary.main" />
                    </Grid>
                    <Grid item xs={4}>
                        <MetricItem icon={<TimerIcon />} label="REST" value={rest ? `${rest}s` : 'N/A'} color="primary.main" />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* Equipment Section */}
                <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <FitnessCenterIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: '1.8rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', fontSize: '1.2rem' }}> {/* Larger Label */}
                            Equipment
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: { xs: 0, sm: 1 } }}> {/* Conditional padding */}
                        {equipmentImageUrl || equipment ? (
                            <>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: 60, height: 60, // Slightly larger image
                                        mr: 2,
                                        borderRadius: '8px',
                                        objectFit: 'contain',
                                        backgroundColor: equipmentImageUrl ? 'transparent' : '#f5f5f5',
                                        border: equipmentImageUrl ? 'none' : '1px solid #e0e0e0'
                                    }}
                                    image={equipmentImageUrl || placeholderImage(equipment || 'Tool', 120, 120, 'f0f0f0', '666666')}
                                    alt={equipment || 'Equipment'}
                                />
                                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}> {/* Larger Value */}
                                    {equipment || 'N/A'}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', pl: 4.5 }}>
                                No specific equipment listed.
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Notes Section */}
                {notes && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <NotesIcon sx={{ mr: 1.5, color: 'info.main', fontSize: '1.8rem' }} />
                                <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', fontSize: '1.2rem' }}> {/* Larger Label */}
                                    Notes
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ pl: { xs: 0, sm: 4.5 }, lineHeight: 1.7, fontSize: '1rem' }}> {/* Larger Value, better line height */}
                                {notes}
                            </Typography>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default ExerciseCard;
