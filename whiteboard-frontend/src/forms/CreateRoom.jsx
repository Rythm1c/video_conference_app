
import { useState, useContext } from "react";
import { AuthContext } from "../pages/AuthContext";
import { Box, Button, TextField, Typography, Switch, FormControlLabel } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateRoom() {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post(
                "/rooms/create/",
                { name, is_private: isPrivate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(`/room/${res.data.code}`);
        } catch (err) {
            setError("Failed to create room");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mx: "auto", mt: 8, width: 360, display: "flex", flexDirection: "column", gap: 2 }}>
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
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained">
                Create
            </Button>
        </Box>
    );
}
