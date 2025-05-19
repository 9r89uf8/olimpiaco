// app/layout.jsx
'use client'; // This is important for ThemeProvider to work correctly in the App Router

import React from 'react';
import Navbar from "@/app/components/nab/Navbar";
import theme from "@/app/theme"; // Your custom theme
import './styles/globals.css';

// Import ThemeProvider and CssBaseline from Material-UI
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const Layout = ({ children }) => {
    return (
        <html lang="en">
        {/*
        The ThemeProvider applies your custom theme to all Material-UI components
        within its scope.
        CssBaseline provides a standardized baseline for styling across browsers,
        and also applies some default background and text colors from your theme.
      */}
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Apply baseline styles and theme background */}
            <body> {/* Body tag should be inside ThemeProvider if CssBaseline affects it directly, but common practice is to put ThemeProvider inside body or wrap body content. For App Router, putting it high up and wrapping content is key. */}
            <Navbar />
            <main>{children}</main>
            </body>
        </ThemeProvider>
        </html>
    );
};

export default Layout;