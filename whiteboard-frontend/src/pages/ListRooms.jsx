// src/ListRooms.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
    Paper, Grid, Button, Typography, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Alert,
    Box,
} from "@mui/material";
import RoomCard from "../components/RoomCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";


export default function ListRooms() {
    const { token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            // If there’s no token in localStorage or AuthContext, redirect to login
            navigate("/login");
            return;
        }

        axios.get("/rooms/list/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => setRooms(res.data))
            .catch((err) => {
                if (err.response?.status === 401) {
                    // Token really is invalid—force logout/redirect
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            });
    }, [token, navigate]);

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
            if (err.response?.status === 401) {
                // Token really is invalid—force logout/redirect
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    };

    return (
        <div style={{ height: "100vh", }}>
            <TopBar />
            <Paper sx={{ p: 2, mt: 1, height: "100%", width: "100%" }}>
                <Typography variant="h5" style={{ fontWeight: "bold" }} gutterBottom>
                    Rooms
                </Typography>

                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
                    <TextField
                        label="Search Rooms"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ mb: 2, borderRadius: 2 }}
                    />
                </Box>


                <Grid container spacing={3}>
                    {rooms.filter((room) => room.name.toLowerCase().includes(search.toLowerCase())).map((r) => (
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
        </div>
    );
}
