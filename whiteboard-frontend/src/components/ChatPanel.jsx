// src/ChatPanel.jsx
import { useState, useEffect, useRef, useContext } from "react";
import {
    Paper,
    List,
    ListItem,
    ListItemText,
    TextField,
    Button,
    Box,
    Typography,
    Badge,
    Snackbar,
    Alert,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { RoomConnectionContext } from "../contexts/roomConnection";

export default function ChatPanel({ messages, setMessages, roomId, username }) {
    const [draft, setDraft] = useState("");
    const [unread, setUnread] = useState(0);
    const [windowFocused, setWindowFocused] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const { subscribe, sendMessage, connected } = useContext(RoomConnectionContext);
    const bottomRef = useRef();

    // Track window focus/blur to manage unread count
    useEffect(() => {
        const onFocus = () => setWindowFocused(true);
        const onBlur = () => setWindowFocused(false);
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    // WebSocket setup
    useEffect(() => {
        if (!connected) return;

        const handle = (msg) => {
            if (msg.type === "chat") {
                setMessages((m) => [...m, { user: msg.username, text: msg.text }]);
                if (!windowFocused) {
                    setUnread((u) => u + 1);
                    setSnackbarOpen(true);
                }
            }
        };

        const unsubscribe = subscribe(handle);
        return unsubscribe;
    }, [roomId, username, connected, subscribe, windowFocused]);

    // Auto-scroll on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendChat = () => {
        if (!draft.trim()) return;
        if (!connected) {
            alert('Not connected to chat server');
            return;
        }
        sendMessage(
            {
                type: "chat",
                username,
                text: draft.trim(),
            }
        );
        setDraft("");
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Reset unread when window regains focus
    useEffect(() => {
        if (windowFocused) setUnread(0);
    }, [windowFocused]);

    return (
        <Box sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column", border: "1px solid #ccc", minWidth: "20%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Badge badgeContent={unread} color="error">
                    <ChatIcon />
                </Badge>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Chat
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 1 }}>
                <List dense>
                    {messages.map((m, i) => (
                        <ListItem key={i}>
                            <ListItemText primary={m.text} secondary={m.user} />
                        </ListItem>
                    ))}
                    <div ref={bottomRef} />
                </List>
            </Box>

            <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                />
                <Button variant="contained" onClick={sendChat}>
                    {connected ? 'Send' : 'Connecting...'}
                </Button>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }} >
                <Alert severity="info" onClose={handleSnackbarClose}>
                    You have {unread} new message{unread !== 1 ? "s" : ""}
                </Alert>
            </Snackbar>
        </Box>
    );
}
