import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#007bff', // A vibrant blue
            // contrastText: '#ffffff',
        },
        secondary: {
            main: '#6f42c1', // A nice purple, or use a teal like '#17a2b8'
            // contrastText: '#ffffff',
        },
        background: {
            default: '#f8f9fa', // A very light grey for the page background
            paper: '#ffffff',
        },
        text: {
            primary: '#212529',
            secondary: '#6c757d',
        }
    },
    typography: {
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif', // Assuming Montserrat from navbar
        h3: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Default buttons to have normal casing
            fontWeight: 500,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px', // Default card border radius
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Default button border radius
                }
            }
        }
    }
});

export default theme;