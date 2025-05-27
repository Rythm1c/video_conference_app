import { useEffect, useState } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Paper,
  Box,
} from "@mui/material";

export default function UserList({ roomId, username }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", username }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "user_list") {
        setUsers(data.users);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId, username]);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Users ({users.length})
      </Typography>
      <List dense>
        {users.map((u) => (
          <ListItem key={u}>
            <ListItemAvatar>
              <Avatar>{u[0].toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={u} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
