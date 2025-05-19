import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    // Inline style objects for the navbar container, navigation bar, and title
    const appBarStyle = {
        background: 'linear-gradient(45deg, #343a40, #212529)', // Softer, warmer tones
        margin: '16px auto',
        borderRadius: '8px',
        width: 'calc(100% - 32px)',
        maxWidth: '1200px',
        overflow: 'visible',
        position: 'relative',
        boxShadow: '0 2px 5px rgba(0,0,0,0.08)' // Slightly enhanced shadow for depth
    };

    const navStyle = {
        minHeight: '64px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px'
    };

    const titleStyle = {
        background: 'linear-gradient(45deg, #6c757d, #495057)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        textTransform: 'uppercase',
        cursor: 'pointer',
        letterSpacing: '0.15em',
        marginLeft: '7px',
        fontSize: '22px',
        textDecoration: 'none'
    };

    return (
        <header style={appBarStyle}>
            <nav style={navStyle}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <span style={titleStyle}>Olimpiaco</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;