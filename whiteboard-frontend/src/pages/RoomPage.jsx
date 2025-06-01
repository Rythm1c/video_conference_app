// RoomPage.jsx
import { useParams } from "react-router-dom";
import { useContext, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Grid, Box } from "@mui/material";
import CanvasWhiteboard from "./canvas";

import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "../components/ChatPanel";
import RoomControls from "../components/RoomControls";

export default function RoomPage() {
    const { roomId } = useParams();
    const { user, token } = useContext(AuthContext);
    const [chatOpen, setChatOpen] = useState(true);
    const localStream = useRef(null);

    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});

    const handleRemoteStream = (peer, stream) => {
        setRemoteStreams((prev) => ({ ...prev, [peer]: stream }));
    };

    return (
        <Container disableGutters maxWidth="xxl" sx={{ height: "90vh", display: "flex", flexDirection: "column", padding: 2 }}>

            <Grid container sx={{ flexGrow: 1, overflow: "hidden" }}>
                {/*  Canvas */}
                <Grid size={{ xs: 12, md: 6 }}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "80%",
                        p: 2,
                    }}>
                    <Box
                        sx={{
                            flexGrow: 1,
                            position: "relative",
                        }} >

                        <CanvasWhiteboard
                            roomId={roomId}
                            username={user.username}
                            token={token} />
                    </Box>
                </Grid>
                {/*  Chat */}
                {chatOpen && <Grid size={{ xs: 12, md: 3 }} sx={{ height: "100%", overflow: "auto" }} >
                    <ChatPanel roomId={roomId} username={user.username} />
                </Grid>}
                {/*  UserList */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ height: "100%", overflow: "auto", p: 2 }}>
                    <ParticipantsPanel roomId={roomId} username={user.username} localStream={localStream} />
                </Grid>
            </Grid>
            <RoomControls
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                streamRef={localStream}
                onLeave={() => {
                }}
            />

        </Container>
    );
}
