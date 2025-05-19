//register page
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from "@/app/services/authService";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { alpha, styled } from '@mui/material/styles';
import { People, Lock, Bolt, Info } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
    textAlign: 'center',
    color: 'white',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    border: `1px solid ${alpha('#ffffff', 0.25)}`,
}));

const RegisterButton = styled(Button)(({ theme }) => ({
    background: theme.palette.primary.main,
    border: 0,
    borderRadius: 25,
    fontSize: 18,
    color: 'white',
    height: 50,
    padding: '0 30px',
    margin: '20px 0 10px 0',
    width: '100%',
    textTransform: 'none',
    '&:hover': {
        background: theme.palette.primary.dark,
        boxShadow: '0 5px 10px 2px rgba(3, 4, 94, 0.2)',
    },
    '&:disabled': {
        background: 'rgba(255, 255, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.5)',
    },
}));

const AnonymousButton = styled(Button)(({ theme }) => ({
    background: theme.palette.secondary.main,
    border: 0,
    borderRadius: 25,
    fontSize: 16,
    color: 'white',
    height: 48,
    padding: '0 20px',
    margin: '10px 0',
    width: '100%',
    textTransform: 'none',
    '&:hover': {
        background: theme.palette.secondary.dark,
    },
}));

const LoginButton = styled(Button)(({ theme }) => ({
    background: 'transparent',
    border: '2px solid white',
    borderRadius: 25,
    fontSize: 16,
    color: 'white',
    height: 45,
    padding: '0 25px',
    margin: '10px 0',
    textTransform: 'none',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderColor: theme.palette.secondary.light,
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: 25,
    '& label.Mui-focused': {
        color: 'white',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'white',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 12,
        },
        '&:hover fieldset': {
            borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'white',
        },
    },
    '& .MuiInputBase-input': {
        color: 'white',
        fontSize: '1.1rem',
        padding: '15px',
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '1.1rem',
    },
    '& .MuiInputLabel-shrink': {
        fontSize: '1rem',
    },
}));

const FeatureBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
    color: 'white',
}));

const AnonymousInfoPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const InfoPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    background: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'flex-start',
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
    background: 'transparent',
    border: '2px solid white',
    borderRadius: 25,
    fontSize: 16,
    color: 'white',
    height: 45,
    padding: '0 25px',
    margin: '10px 0',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderColor: theme.palette.secondary.main,
    },
}));

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [country, setCountry] = useState('');
    const [disableRegister, setDisableRegister] = useState(false);
    const [showAnonymousDialog, setShowAnonymousDialog] = useState(false);
    const [showAnonymousInfo, setShowAnonymousInfo] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const router = useRouter();
    const [turnstileToken, setTurnstileToken] = useState(null);
    let data = { email, password, username, country, turnstileToken };

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (window.turnstile) {
    //             window.turnstile.render('#turnstile-widget', {
    //                 sitekey: '0x4AAAAAAA_HdjBUf9sbezTK',
    //                 callback: (token) => setTurnstileToken(token),
    //             });
    //             clearInterval(interval);
    //         }
    //     }, 100);
    //
    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        fetch('https://ipinfo.io/json?token=5a17bbfded96f7')
            .then(response => response.json())
            .then(data => {
                setCountry(data.country);
            });
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setDisableRegister(true);
        const { user, error } = await registerUser(data);
        setDisableRegister(false);
        if (user) {
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'user_registered', {
                    event_category: 'CTA',
                    event_label: 'Register Button'
                });
            }
            router.push('/dm');
        } else {
            console.error(error);
        }
    };

    const handleLogin = () => {
        router.push('/login');
    };

    const handleRegularAccount = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setIsAnonymous(false);
    };

    const handleAnonymousClick = () => {
        const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();
        setUsername(randomNumber);
        setEmail(`${randomNumber}@gmail.com`);
        setPassword(randomNumber);
        setIsAnonymous(true);
        setShowAnonymousDialog(true);
    };

    const handleToggleAnonymousInfo = () => {
        setShowAnonymousInfo(!showAnonymousInfo);
    };

    const handleClearAuto = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setIsAnonymous(false);
        setShowAnonymousDialog(false);
    };

    const handleCloseDialog = () => {
        setShowAnonymousDialog(false);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 3,
            }}
        >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <GlassCard sx={{ width: '450px', maxWidth: '100%', marginTop: 3 }}>
                    <CardContent sx={{ padding: 4 }}>
                        <Typography variant="h4"
                                    sx={{
                                        color: 'white',
                                        marginBottom: 4,
                                        fontWeight: 'bold',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                            Crear Cuenta
                        </Typography>

                        <Box sx={{ marginBottom: 4, textAlign: 'left' }}>
                            <FeatureBox>
                                <People sx={{ marginRight: 2, color: '#64B5F6', fontSize: 36 }} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    2M+ usuarios activos
                                </Typography>
                            </FeatureBox>
                            <FeatureBox>
                                <Lock sx={{ marginRight: 2, color: '#81C784', fontSize: 36 }} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    100% anónimo y seguro
                                </Typography>
                            </FeatureBox>
                            <FeatureBox>
                                <Bolt sx={{ marginRight: 2, color: '#FFB74D', fontSize: 36 }} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    Mensajes encriptados
                                </Typography>
                            </FeatureBox>
                        </Box>


                        <form onSubmit={handleRegister} style={{ marginTop: 25 }}>
                            <StyledTextField
                                label="Nombre o Apodo"
                                name="name"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <StyledTextField
                                label="Correo Electrónico"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <StyledTextField
                                label="Contraseña"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                variant="outlined"
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/*<div id="turnstile-widget"></div>*/}

                            <RegisterButton
                                type="submit"
                                disabled={disableRegister}
                            >
                                Crear Cuenta
                            </RegisterButton>
                        </form>



                        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                                ¿Ya tienes una cuenta?
                            </Typography>
                            <LoginButton onClick={handleLogin}>
                                Iniciar Sesión
                            </LoginButton>
                        </Box>
                    </CardContent>
                </GlassCard>
            </Box>

            <GlassCard sx={{ padding: 2, maxWidth: '100%', marginTop: 5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src="https://chicagocarhelp.s3.us-east-2.amazonaws.com/Untitled+design+(3).png"
                        alt="logo"
                        style={{ width: 45, height: "auto", marginRight: 10 }}
                    />
                    <Typography sx={{ color: 'white', fontSize: '16px' }}>
                        © 2025 - Todos los Derechos Reservados NoviaChat. NoviaChat 2025.
                    </Typography>
                </Box>
            </GlassCard>
        </Box>
    );
};

export default RegisterPage;

