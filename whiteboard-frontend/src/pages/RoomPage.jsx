// RoomPage.jsx
import { useParams } from "react-router-dom";
import { useContext, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Grid, Box, Typography } from "@mui/material";
import CanvasWhiteboard from "./canvas";

import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "../components/ChatPanel";
import RoomControls from "../components/RoomControls";

// no canvas open
const FirstLayout = ({ chatOpen, canvasOpen, user, localStream, roomId }) => {
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flexGrow: 1, display: "flex", position: "relative", gap: 1 }}>
                <Box sx={{ flexGrow: 1, display: "flex", p: 0 }}>
                    <ParticipantsPanel roomId={roomId} username={user.username} canvasOpen={canvasOpen} localStream={localStream} />
                </Box>
                {chatOpen && (
                    <ChatPanel roomId={roomId} username={user.username} />
                )}
            </Box>
        </Box>
    );
}
// canvas open
const SecondLayout = ({ chatOpen, canvasOpen, user, localStream, roomId }) => {
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flexGrow: 1, display: "flex" }}>
                <Box sx={{ flexGrow: 1, border: "2px dashed #ccc", borderRadius: 2, mr: 2 }}>
                    <Typography variant="h6" align="center" mt={2}>Canvas Area</Typography>
                </Box>
                {chatOpen && (
                    <ChatPanel roomId={roomId} username={user.username} />
                )}
            </Box>
            <ParticipantsPanel roomId={roomId} username={user.username} canvasOpen={canvasOpen} localStream={localStream} />

        </Box>
    );
}

export default function RoomPage() {
    const { roomId } = useParams();
    const { user, token } = useContext(AuthContext);
    const [chatOpen, setChatOpen] = useState(false);
    const [canvasOpen, setCanvasOpen] = useState(false);
    const localStream = useRef(null);

    const [users, setUsers] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState({});

    const handleRemoteStream = (peer, stream) => {
        setRemoteStreams((prev) => ({ ...prev, [peer]: stream }));
    };

    return (
        <Container disableGutters maxWidth="xxl" sx={{ height: "100vh", display: "flex", flexDirection: "column", padding: 1, gap: 1 }}>

            {/* <Grid container sx={{ flexGrow: 1, overflow: "hidden" }}>

                {
                    canvasOpen && <Grid size={{ xs: 12, md: 6 }}
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
                }

                {
                    chatOpen && <Grid size={{ xs: 12, md: 3 }} sx={{ height: "100%", overflow: "auto", p: 2 }} >
                        <ChatPanel roomId={roomId} username={user.username} />
                    </Grid>
                }

                <Grid size={{ xs: 12, md: 3 }} sx={{ height: "100%", overflow: "auto", p: 2 }}>
                    <ParticipantsPanel roomId={roomId} username={user.username} canvasOpen={canvasOpen} localStream={localStream} />
                </Grid>
            </Grid> */}

            {canvasOpen ?
                <SecondLayout
                    chatOpen={chatOpen}
                    canvasOpen={canvasOpen}
                    user={user}
                    localStream={localStream}
                    roomId={roomId} />
                :
                <FirstLayout
                    chatOpen={chatOpen}
                    canvasOpen={canvasOpen}
                    user={user}
                    localStream={localStream}
                    roomId={roomId} />
            }


            <RoomControls
                chatOpen={chatOpen}
                canvasOpen={canvasOpen}
                setCanvasOpen={setCanvasOpen}
                setChatOpen={setChatOpen}
                streamRef={localStream}
                onLeave={() => {
                }}
            />

        </Container>
    );
}
