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
import VideoCard from "../components/VideoCard";

export default function ParticipantsPanel({ canvasOpen, roomId, username, localStream }) {
    const ws = useRef(null);
    const pcs = useRef(new Map());

    const [users, setUsers] = useState([]);
    const [streams, setStreams] = useState({});
    const [status, setStatus] = useState({}); // { username: { mic: bool, cam: bool } }
    const [userRows, setUserRows] = useState([]);
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

    useEffect(() => {
        //if (canvasOpen) return;
        let rows = [];
        const MAX_PER_ROW = 6; // Adjust as needed for your layout
        for (let i = 0; i < users.length; i += MAX_PER_ROW) {
            rows.push(users.slice(i, i + MAX_PER_ROW));
        }
        setUserRows(rows);
    }, [users, canvasOpen]);

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
        <>
            {canvasOpen ?
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2, overflowY: "auto", border: "1px solid #ccc", borderRadius: 0, padding: 1 }}>
                    {users.map((u) => (
                        <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", minHeight: 200, width: 200 }}>
                            <VideoCard
                                stream={streams[u]}
                                user={u}
                                username={username} />
                        </Box>
                    ))}
                </Box>
                :
                <Box sx={{ display: "flex", flexDirection: "column", width: "100%", border: "1px solid #ccc", borderRadius: 0, padding: 1 }}>

                    {
                        userRows.map((row, rowIndex) => (
                            <Box key={rowIndex} sx={{ display: "flex", flexGrow: 1 }}>
                                {row.map((user) => (
                                    <Box
                                        key={user}
                                        sx={{
                                            flex: 1,
                                            maxWidth: `${100 / row.length}%`,
                                            aspectRatio: "11 / 3",
                                            p: 1,
                                            position: "relative",
                                        }}>
                                        <VideoCard
                                            stream={streams[user]}
                                            user={user}
                                            username={username} />
                                    </Box>
                                ))}
                            </Box>
                        ))
                    }
                </Box>
            }
        </>
    );

}
