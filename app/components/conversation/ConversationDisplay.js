// app/components/ConversationDisplay.jsx
'use client';

import { useEffect, useRef } from 'react';
import {
    Paper,
    Box,
    Stack,
    Typography,
    CircularProgress,
    Chip
} from '@mui/material';

// Helper function to get model name (avoids repeating logic)
const getModelName = (models, selectedModelId) => {
    return models?.find(m => m.id === selectedModelId)?.modelName || 'Assistant';
};

export default function ConversationDisplay({
                                                conversation,
                                                isLoading, // Loading state for generating response
                                                isConversationLoading, // Loading state for initial conversation load
                                                isDeleting, // Deleting state (for empty message)
                                                models, // Needed for model names
                                                selectedModelId, // Needed for model names
                                                conversationEndRef // Ref to scroll to bottom
                                            }) {

    // Scroll to bottom when conversation updates
    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, conversationEndRef]); // Depend on conversation and the ref itself

    return (
        <Paper elevation={1} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#f7f7f7' }}>
            {/* Loading indicator for initial conversation load */}
            {isConversationLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading conversation...</Typography>
                </Box>
            )}

            {/* Only show conversation stack if NOT loading conversation */}
            {!isConversationLoading && (
                <Stack spacing={2}>
                    {conversation.length === 0 && !isLoading && !isDeleting && (
                        <Typography color="textSecondary" align="center">
                            {models && models.length > 0 ? 'Select a model and start the conversation, or load previous messages.' : 'Loading models or no models available.'}
                        </Typography>
                    )}
                    {isDeleting && conversation.length === 0 && (
                        <Typography color="textSecondary" align="center">
                            Deleting conversation...
                        </Typography>
                    )}

                    {conversation.map((message, index) => (
                        <Box
                            key={message.id || index} // Use message.id if available
                            sx={{
                                display: 'flex',
                                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                ml: message.role === 'user' ? 'auto' : 0,
                                mr: message.role === 'model' ? 'auto' : 0,
                            }}
                        >
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 1.5,
                                    maxWidth: '80%',
                                    bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                    borderRadius: message.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                    wordBreak: 'break-word'
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Chip
                                        label={message.role === 'user' ? 'You' : getModelName(models, selectedModelId)}
                                        size="small"
                                        color={message.role === 'user' ? 'default' : 'primary'}
                                        variant={message.role === 'user' ? 'outlined' : 'filled'}
                                        sx={{ fontWeight: 'medium', color: message.role === 'user' ? 'primary.main' : undefined }}
                                    />
                                </Stack>
                                <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {message.content}
                                </Typography>
                            </Paper>
                        </Box>
                    ))}

                    {/* Loading indicator for generating response */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1, pt: 1 }}>
                            <Chip
                                icon={<CircularProgress size={16} color="inherit" />}
                                label={`${getModelName(models, selectedModelId)} is thinking...`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>
                    )}

                    {/* Element to scroll to */}
                    <div ref={conversationEndRef} />
                </Stack>
            )}
        </Paper>
    );
}