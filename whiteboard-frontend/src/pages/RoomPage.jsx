// RoomPage.jsx
import { useParams } from "react-router-dom";
import { useContext, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Grid, Typography } from "@mui/material";
import CanvasWhiteboard from "./canvas";

import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "../components/ChatPanel";
import RoomControls from "../components/RoomControls";

export default function RoomPage() {
    const { roomId } = useParams();
    const { user, token } = useContext(AuthContext);
    const localStream = useRef(null);

    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});

    const handleRemoteStream = (peer, stream) => {
        setRemoteStreams((prev) => ({ ...prev, [peer]: stream }));
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                Room: {roomId}
            </Typography>
            <Grid container spacing={3}>
                {/* Left: Chat */}
                <Grid item xs={12} md={3} height={"80%"}>
                    <ChatPanel roomId={roomId} username={user.username} />
                </Grid>

                {/* Center: Canvas */}
                <Grid item xs={12} md={6}>

                    <CanvasWhiteboard
                        roomId={roomId}
                        username={user.username}
                        token={token}
                    />
                </Grid>

                {/* Right: UserList */}
                <Grid item xs={12} md={3}>
                    <ParticipantsPanel roomId={roomId} username={user.username} localStream={localStream} />
                </Grid>
            </Grid>
            <RoomControls
                streamRef={localStream}
                onLeave={() => {
                    // You can manually close sockets here if needed
                }}
            />

        </Container>
    );
}
