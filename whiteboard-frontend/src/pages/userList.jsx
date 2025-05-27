// src/UserList.jsx
import React, { useEffect, useContext } from "react";
import {
  Avatar,
  Card,
  CardHeader,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { AuthContext } from "./AuthContext";

export default function UserList({
  roomId,
  username,
  remoteStreams,
  onUserListUpdate,
}) {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = React.useState([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", username }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "user_list") {
        setUsers(msg.users);
        onUserListUpdate(msg.users);
      }
    };
    return () => ws.close();
  }, [roomId, username, onUserListUpdate]);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Users ({users.length})
      </Typography>

      {users.map((u) => (
        <Card key={u} sx={{ mb: 1, p: 1 }}>
          <CardHeader
            avatar={<Avatar>{u[0].toUpperCase()}</Avatar>}
            title={u}
            sx={{ pb: 0 }}
          />
          <Box sx={{ pt: 1, textAlign: "center" }}>
            {remoteStreams && remoteStreams[u] ? (
              <video
                style={{ width: "100%", maxHeight: 120, borderRadius: 4 }}
                autoPlay
                muted={u === username}
                ref={(video) => {
                  if (video && !video.srcObject) {
                    video.srcObject = remoteStreams[u];
                  }
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No video
              </Typography>
            )}
          </Box>
        </Card>
      ))}
    </Paper>
  );
}
