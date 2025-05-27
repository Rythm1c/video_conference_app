import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Paper, List, ListItem, ListItemText, Button, Typography } from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ListRooms() {
    const { token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        axios
            .get("/rooms/public/", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setRooms(res.data))
            .catch(console.error);
    }, [token]);

    return (
        <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Public Rooms
            </Typography>
            <List>
                {rooms.map((r) => (
                    <ListItem key={r.code} secondaryAction={
                        <Button component={Link} to={`/room/${r.code}`}>Join</Button>
                    }>
                        <ListItemText primary={r.name} secondary={r.code} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
