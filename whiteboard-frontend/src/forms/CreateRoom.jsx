// src/CreateRoom.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
    Box, Button, TextField, Typography, Switch, FormControlLabel, Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const [ackPassword, setAckPassword] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setAckPassword(null);
        try {
            const res = await axios.post(
                "/rooms/create/",
                { name, is_private: isPrivate, password: password.trim() || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const roomCode = res.data.code;
            if (isPrivate) {
                setAckPassword(res.data.password);
            } else {
                navigate(`/room/${roomCode}`);
            }
        } catch (err) {
            console.error(err.response?.data);
            setError(err.response?.data?.detail || "Failed to create room.");
        }
    };

    return (
        <Box component="form"
            onSubmit={handleSubmit}
            sx={{ mx: "auto", mt: 8, width: 360, display: "flex", flexDirection: "column", gap: 2 }}
        >
            <Typography variant="h5">Create a Room</Typography>
            <TextField
                label="Room Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                    />
                }
                label="Private Room"
            />
            {isPrivate && (
                <TextField
                    label="Password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Leave blank to auto-generate"
                />
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained">Create</Button>

            {ackPassword && (
                <Alert severity="info">
                    Private room created! Password: <strong>{ackPassword}</strong>
                    <Box mt={1}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/room/${ackPassword ? name : ""}`)} >
                            Go to Room
                        </Button>
                    </Box>
                </Alert>
            )}
        </Box>
    );
}
