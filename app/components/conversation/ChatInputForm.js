// app/components/ChatInputForm.jsx
'use client';

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import {
    Paper,
    Box,
    Stack,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Tooltip,
    Alert,
    Menu,
    MenuItem,
    ListItemIcon,
    Typography,
    Divider,
    Dialog,         // Import Dialog components
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { useStore } from '@/app/store/store';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import EditNoteIcon from '@mui/icons-material/EditNote'; // Icon for editing system prompt
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Icon for deleting system prompt

// Assuming these functions are correctly implemented in your service file
// and handle API calls to /api/manageSystemPrompt
import { addSystemPrompt, deleteSystemPrompt } from "@/app/services/conversationService";

export default function ChatInputForm({
                                          models,
                                          selectedModelId,
                                          prompt,
                                          isLoading, // Loading state for generating response
                                          isDeleting, // Loading state for deleting conversation
                                          isModelsLoading, // Loading state for fetching models
                                          modelsError, // Error fetching models
                                          user, // Needed for user ID and enabling actions
                                          isConversationLoading, // Disable input while conversation loads
                                          handleModelChange,
                                          handlePromptChange,
                                          handleSubmit,
                                          handleDeleteConversation,
                                          handleDeleteLatestPrompt,
                                          error // General error from parent (submission/deletion errors)
                                      }) {

    // --- State for Settings/Model Menu ---
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const systemPrompt = useStore((state) => state.systemPrompt);

    // --- State for System Prompt Dialog ---
    const [isSystemPromptDialogOpen, setIsSystemPromptDialogOpen] = useState(false);
    const [systemPromptInput, setSystemPromptInput] = useState('');
    const [isSystemPromptLoading, setIsSystemPromptLoading] = useState(false);
    const [systemPromptError, setSystemPromptError] = useState('');

    // --- Effect to pre-fill dialog input when opened ---
    useEffect(() => {
        // If a current prompt is passed, use it when the dialog opens
        // Otherwise, keep the input empty or as it was.
        // Reset when dialog opens based on the prop.
        if (isSystemPromptDialogOpen) {
            setSystemPromptInput(systemPrompt || '');
            setSystemPromptError(''); // Clear previous errors when opening
        }
    }, [isSystemPromptDialogOpen]);


    // --- Handlers for Settings/Model Menu ---
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleModelSelect = (modelId) => {
        handleModelChange({ target: { value: modelId } });
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        handleDeleteConversation();
        handleMenuClose();
    };

    const handleDeleteLatestPromptClick = () => {
        // Assuming handleDeleteLatestPrompt handles its own loading/error state
        handleDeleteLatestPrompt({ userId: user.uid, modelId: selectedModelId });
        handleMenuClose();
    };


    // --- Handlers for System Prompt Dialog ---
    const handleOpenSystemPromptDialog = () => {
        setIsSystemPromptDialogOpen(true);
        handleMenuClose(); // Close the menu when opening the dialog
    };

    const handleCloseSystemPromptDialog = () => {
        setIsSystemPromptDialogOpen(false);
        // Optionally reset input on close, or keep it for re-opening
        // setSystemPromptInput('');
    };

    const handleSystemPromptInputChange = (event) => {
        setSystemPromptInput(event.target.value);
    };

    // --- Handler to SAVE System Prompt ---
    const handleSaveSystemPrompt = async () => {
        if (!user?.uid || !selectedModelId) {
            setSystemPromptError("User ID or Model ID is missing.");
            return;
        }
        setIsSystemPromptLoading(true);
        setSystemPromptError('');
        try {
            // Call the service function to add/update the system prompt
            const result = await addSystemPrompt({userId: user.uid, modelId:selectedModelId, systemInstruction: systemPromptInput});
            // Handle success (e.g., close dialog, maybe notify parent)
            handleCloseSystemPromptDialog();
            console.log("System prompt saved:", result); // For debugging
        } catch (err) {
            console.error("Failed to save system prompt:", err);
            setSystemPromptError(err.message || "Failed to save system prompt. Please try again.");
        } finally {
            setIsSystemPromptLoading(false);
        }
    };

    // --- Handler to DELETE System Prompt ---
    const handleDeleteSystemPrompt = async () => {
        if (!user?.uid || !selectedModelId) {
            // Although button should be disabled, add a check
            console.error("Cannot delete system prompt: User ID or Model ID missing.");
            handleMenuClose();
            return;
        }
        // Close menu first
        handleMenuClose();
        // Consider adding a confirmation dialog here in a real app
        setIsSystemPromptLoading(true); // Use a general loading indicator or a specific one
        setSystemPromptError(''); // Clear previous errors
        try {
            // Call the service function to delete the system prompt
            await deleteSystemPrompt({userId:user.uid, modelId: selectedModelId});
            console.log("System prompt deleted successfully."); // For debugging
        } catch (err) {
            console.error("Failed to delete system prompt:", err);
            // Display error feedback to the user (e.g., using a Snackbar or Alert)
            // For simplicity, we'll just log it here, but you'd update state
            // setSystemPromptError(err.message || "Failed to delete system prompt.");
        } finally {
            setIsSystemPromptLoading(false); // Reset loading state
        }
    };


    // --- Enter Key Submission Handler ---
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && prompt.trim() && selectedModelId && !isDeleting && !isConversationLoading) {
                handleSubmit(e);
            }
        }
    };

    // --- Determine if submit should be disabled ---
    const isSubmitDisabled = isLoading || !prompt.trim() || !selectedModelId || isDeleting || isConversationLoading || isModelsLoading || !!modelsError || isSystemPromptLoading;
    // --- Determine if input elements should be disabled ---
    const isInputDisabled = isLoading || isDeleting || isConversationLoading || isModelsLoading || !!modelsError || !selectedModelId || isSystemPromptLoading;
    // --- Determine if settings button/menu items should be disabled ---
    const isSettingsDisabled = isModelsLoading || !!modelsError || isLoading || isDeleting || isConversationLoading || isSystemPromptLoading;


    return (
        <Paper elevation={3} sx={{ p: 2, mt: 'auto' }}>
            {/* Display general/model errors passed from parent */}
            {(error || modelsError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error: {error || modelsError}
                </Alert>
            )}
            {/* Display system prompt specific errors (could be placed elsewhere) */}
            {systemPromptError && !isSystemPromptDialogOpen && ( // Show only if dialog is closed
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSystemPromptError('')}>
                    System Prompt Error: {systemPromptError}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={1.5}>
                    {/* --- Input Row: Settings Button, Text Field, Send Button --- */}
                    <Stack direction="row" spacing={1} alignItems="flex-start">

                        {/* --- Settings/Model Button (Opens Menu) --- */}
                        <Tooltip title="Settings & Model Selection">
                             <span>
                                 <IconButton
                                     id="settings-menu-button"
                                     aria-controls={openMenu ? 'settings-menu' : undefined}
                                     aria-haspopup="true"
                                     aria-expanded={openMenu ? 'true' : undefined}
                                     onClick={handleMenuOpen}
                                     size="large"
                                     disabled={isSettingsDisabled} // Use consolidated disable logic
                                     sx={{ height: '56px', width: '56px', flexShrink: 0, alignSelf: 'center' }}
                                 >
                                    {isModelsLoading ? <CircularProgress size={24} color="inherit"/> : <SettingsIcon />}
                                </IconButton>
                             </span>
                        </Tooltip>

                        {/* --- Settings & Model Selection Menu --- */}
                        <Menu
                            id="settings-menu"
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            MenuListProps={{ 'aria-labelledby': 'settings-menu-button' }}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        >
                            {/* --- Model Selection Section --- */}
                            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>Select Model</Typography>
                            {isModelsLoading && <MenuItem disabled><em>Loading models...</em></MenuItem>}
                            {modelsError && <MenuItem disabled><em>Error loading models</em></MenuItem>}
                            {!isModelsLoading && !modelsError && (!models || models.length === 0) && (
                                <MenuItem disabled><em>No models available</em></MenuItem>
                            )}
                            {!isModelsLoading && !modelsError && models && models.map((model) => (
                                <MenuItem
                                    key={model.id}
                                    selected={model.id === selectedModelId}
                                    onClick={() => handleModelSelect(model.id)}
                                    disabled={isSettingsDisabled} // Disable during actions
                                >
                                    {model.id === selectedModelId && (
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                                            <CheckIcon fontSize="small" />
                                        </ListItemIcon>
                                    )}
                                    <Typography sx={{ ml: model.id !== selectedModelId ? '28px' : 0 }}>
                                        {model.modelName} ({model.company})
                                    </Typography>
                                </MenuItem>
                            ))}

                            {/* --- Divider --- */}
                            <Divider sx={{ my: 1 }} />

                            {/* --- System Prompt Actions --- */}
                            <MenuItem
                                onClick={handleOpenSystemPromptDialog}
                                // Disable if no user/model selected or during other actions
                                disabled={!user?.uid || !selectedModelId || isSettingsDisabled}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                                    {/* Show spinner if system prompt is currently loading */}
                                    {isSystemPromptLoading ? <CircularProgress size={20} /> : <EditNoteIcon fontSize="small" />}
                                </ListItemIcon>
                                <Typography>Edit System Prompt</Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={handleDeleteSystemPrompt}
                                // Disable same conditions as edit, plus if no current prompt exists (optional)
                                disabled={!user?.uid || !selectedModelId || isSettingsDisabled /* || !currentSystemPrompt */}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: 'warning.dark' }}>
                                    {/* Consider a specific loading state for delete if needed */}
                                    {isSystemPromptLoading ? <CircularProgress size={20} color="inherit"/> : <DeleteSweepIcon fontSize="small" />}
                                </ListItemIcon>
                                <Typography sx={{ color: 'warning.dark' }}>Delete System Prompt</Typography>
                            </MenuItem>

                            {/* --- Divider --- */}
                            <Divider sx={{ my: 1 }} />

                            {/* --- Conversation Actions --- */}
                            <MenuItem
                                onClick={handleDeleteClick}
                                disabled={!user?.uid || isSettingsDisabled} // Disable if no user or during actions
                                sx={{ color: 'error.main' }}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: 'error.main' }}>
                                    {isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon fontSize="small" />}
                                </ListItemIcon>
                                <Typography>{isDeleting ? 'Deleting...' : 'Delete Conversation'}</Typography>
                            </MenuItem>
                            <MenuItem
                                onClick={handleDeleteLatestPromptClick}
                                disabled={!user?.uid || isSettingsDisabled} // Disable if no user or during actions
                                sx={{ color: 'error.main' }}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5, color: 'error.main' }}>
                                    {/* Assuming handleDeleteLatestPrompt handles its own loading state */}
                                    {/* If not, you might need another state like isDeletingLatest */}
                                    <DeleteIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography>Delete Latest Prompt</Typography>
                            </MenuItem>
                        </Menu>

                        {/* --- Prompt Text Field --- */}
                        <TextField
                            id="prompt"
                            placeholder={selectedModelId ? "Enter your message..." : "Select a model first"}
                            multiline
                            minRows={1}
                            maxRows={6}
                            value={prompt}
                            onChange={handlePromptChange}
                            required
                            fullWidth
                            disabled={isInputDisabled} // Use consolidated disable logic
                            sx={{ flexGrow: 1 }}
                            onKeyDown={handleKeyDown}
                            size="large"
                        />

                        {/* --- Send Button --- */}
                        <Tooltip title={isSubmitDisabled ? (modelsError ? "Cannot send, model error" : (!selectedModelId ? "Select a model first" : (!prompt.trim() ? "Enter a message" : "Processing..."))) : "Send message"}>
                            <span>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitDisabled} // Use consolidated disable logic
                                    size="large"
                                    sx={{ height: '56px', minWidth: '56px', flexShrink: 0, alignSelf: 'flex-end', mb: '1px' }}
                                    aria-label="Send message"
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack> {/* End of Input Row */}
                </Stack>
            </Box>

            {/* --- System Prompt Edit Dialog --- */}
            <Dialog
                open={isSystemPromptDialogOpen}
                onClose={handleCloseSystemPromptDialog}
                fullWidth
                maxWidth="sm" // Adjust size as needed
            >
                <DialogTitle>Edit System Prompt</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter the system instruction for the AI model in this conversation. Leave blank to remove specific instructions.
                    </DialogContentText>
                    {/* Display errors specific to the dialog actions */}
                    {systemPromptError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {systemPromptError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="system-prompt-input"
                        label="System Instruction"
                        type="text"
                        fullWidth
                        multiline
                        rows={4} // Adjust rows as needed
                        variant="outlined"
                        value={systemPromptInput}
                        onChange={handleSystemPromptInputChange}
                        disabled={isSystemPromptLoading} // Disable input while saving
                    />
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}> {/* Add padding */}
                    <Button onClick={handleCloseSystemPromptDialog} disabled={isSystemPromptLoading}>Cancel</Button>
                    <Button
                        onClick={handleSaveSystemPrompt}
                        variant="contained"
                        disabled={isSystemPromptLoading} // Disable while saving
                        startIcon={isSystemPromptLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSystemPromptLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}


