// src/ListRooms.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
    Paper, Grid, Button, Typography, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Alert,
} from "@mui/material";
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import RoomCard from "../components/RoomCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function ListRooms() {
    const { token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/rooms/list/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => setRooms(res.data))
            .catch(console.error);
    }, []);

    const handleJoinClick = (room) => {
        if (room.is_private) {
            setSelected(room);
            setOpen(true);
            setPassword("");
            setError("");
        } else {
            navigate(`/room/${room.code}`);
        }
    };

    const handleConfirm = async () => {
        try {
            await axios.post("/rooms/join/", {
                code: selected.code, password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpen(false);
            navigate(`/room/${selected.code}`);
        } catch (err) {
            setError(err.response?.data?.detail || "Join failed");
        }
    };

    return (
        <>
            <Paper sx={{ p: 2, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    All Rooms
                </Typography>
                <Grid container spacing={3}>
                    {rooms.map((r) => (
                        <Grid item xs={12} sm={6} md={3} key={r.id}>
                            <RoomCard room={r} handleJoinClick={handleJoinClick} />
                        </Grid>
                    ))}
                </Grid>

            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Enter Password</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="dense"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained">Join</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
