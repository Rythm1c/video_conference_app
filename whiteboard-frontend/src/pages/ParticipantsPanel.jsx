import { useEffect, useRef, useState } from "react";
import {
    Avatar,
    Box,
    Card,
    CardHeader,
    CardContent,
    Grid,
    Paper,
    Typography,
    Tooltip,
} from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

export default function ParticipantsPanel({ roomId, username, localStream }) {
    const ws = useRef(null);
    const pcs = useRef(new Map());

    const [users, setUsers] = useState([]);
    const [streams, setStreams] = useState({});
    const [status, setStatus] = useState({}); // { username: { mic: bool, cam: bool } }

    const updateStream = (user, stream) =>
        setStreams((prev) => ({ ...prev, [user]: stream }));

    const updateStatus = (user, mic, cam) =>
        setStatus((prev) => ({ ...prev, [user]: { mic, cam } }));

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);

        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({ type: "join", username }));
        };

        ws.current.onmessage = async (e) => {
            const msg = JSON.parse(e.data);
            const { type, payload, sender, target } = msg;

            if (type === "user_list") {
                setUsers(msg.users);
            }

            if (type === "media_status" && sender !== username) {
                setStatus((prev) => ({ ...prev, [sender]: payload }));
            }

            if (sender === username) return;

            if (type === "webrtc_offer") {
                const pc = createPeerConnection(sender);
                pcs.current.set(sender, pc);

                await pc.setRemoteDescription(new RTCSessionDescription(payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                ws.current.send(
                    JSON.stringify({
                        type: "webrtc_answer",
                        sender: username,
                        target: sender,
                        payload: answer,
                    })
                );
            }

            if (type === "webrtc_answer" && pcs.current.has(sender)) {
                await pcs.current.get(sender).setRemoteDescription(
                    new RTCSessionDescription(payload)
                );
            }

            if (type === "webrtc_candidate" && pcs.current.has(sender)) {
                try {
                    await pcs.current.get(sender).addIceCandidate(
                        new RTCIceCandidate(payload)
                    );
                } catch (err) {
                    console.error("Failed to add ICE candidate", err);
                }
            }
        };

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream.current = stream;
                updateStream(username, stream);

                const micOn = stream.getAudioTracks()[0]?.enabled ?? true;
                const camOn = stream.getVideoTracks()[0]?.enabled ?? true;
                updateStatus(username, micOn, camOn);

                // Broadcast local status
                ws.current.send(
                    JSON.stringify({
                        type: "media_status",
                        sender: username,
                        payload: { mic: micOn, cam: camOn },
                    })
                );
            })
            .catch(console.error);

        return () => {
            ws.current?.close();
            pcs.current.forEach((pc) => pc.close());
        };
    }, [roomId, username]);

    // Create peer connections as users join
    useEffect(() => {
        if (!localStream.current) return;

        users.forEach((peer) => {
            if (peer === username || pcs.current.has(peer)) return;

            const pc = createPeerConnection(peer);
            pcs.current.set(peer, pc);

            pc.createOffer()
                .then((offer) => {
                    pc.setLocalDescription(offer);
                    ws.current.send(
                        JSON.stringify({
                            type: "webrtc_offer",
                            sender: username,
                            target: peer,
                            payload: offer,
                        })
                    );
                })
                .catch(console.error);
        });
    }, [users, username]);

    const createPeerConnection = (peer) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        localStream.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStream.current);
        });

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                ws.current.send(
                    JSON.stringify({
                        type: "webrtc_candidate",
                        sender: username,
                        target: peer,
                        payload: e.candidate,
                    })
                );
            }
        };

        pc.ontrack = (e) => {
            const [stream] = e.streams;
            updateStream(peer, stream);
        };

        return pc;
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Participants ({users.length})
            </Typography>
            <Grid container spacing={1}>
                {users.map((u) => (
                    <Grid item xs={12} key={u}>
                        <Card variant="outlined">
                            <CardHeader
                                avatar={<Avatar>{u[0].toUpperCase()}</Avatar>}
                                title={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {u === username ? `${u} (You)` : u}
                                        {!status[u]?.mic && (
                                            <Tooltip title="Mic off">
                                                <MicOffIcon fontSize="small" color="disabled" />
                                            </Tooltip>
                                        )}
                                        {!status[u]?.cam && (
                                            <Tooltip title="Camera off">
                                                <VideocamOffIcon fontSize="small" color="disabled" />
                                            </Tooltip>
                                        )}
                                    </Box>
                                }
                            />
                            <CardContent sx={{ pt: 0 }}>
                                {streams[u] ? (
                                    <video
                                        autoPlay
                                        muted={u === username}
                                        ref={(el) => {
                                            if (el && el.srcObject !== streams[u]) {
                                                el.srcObject = streams[u];
                                            }
                                        }}
                                        style={{
                                            width: 120,
                                            height: 90,
                                            objectFit: "cover",
                                            borderRadius: 4,
                                            backgroundColor: "#000",
                                        }}
                                    />
                                ) : (
                                    <Typography color="textSecondary">No video</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}
