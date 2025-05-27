// src/VideoChat.jsx
import { useEffect, useRef } from "react";
import { Box, Button, Stack } from "@mui/material";

export default function VideoChat({ roomId, username, onRemoteStream }) {
    const localVid = useRef();
    const remoteVid = useRef();
    const pc = useRef();
    const ws = useRef();
    const lastSignalSender = useRef(null);  // track who sent the last offer/answer/candidate

    useEffect(() => {
        // 1) Open WebSocket for signaling
        ws.current = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);
        ws.current.onmessage = async (e) => {
            const msg = JSON.parse(e.data);
            const { type, payload, sender } = msg;

            // Remember who sent this, so we know whose stream is incoming
            if (type.startsWith("webrtc_")) lastSignalSender.current = sender;

            if (type === "webrtc_offer" && sender !== username) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                ws.current.send(
                    JSON.stringify({ type: "webrtc_answer", payload: answer, sender: username })
                );
            }

            if (type === "webrtc_answer" && sender !== username) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            }

            if (type === "webrtc_candidate" && sender !== username) {
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(payload));
                } catch (err) {
                    console.error(err);
                }
            }

            // Auto-start on second join
            if (type === "start_call" && !pc.current.localDescription) {
                const offer = await pc.current.createOffer();
                await pc.current.setLocalDescription(offer);
                ws.current.send(
                    JSON.stringify({ type: "webrtc_offer", payload: offer, sender: username })
                );
            }
        };

        // 2) Set up RTCPeerConnection
        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                ws.current.send(
                    JSON.stringify({
                        type: "webrtc_candidate",
                        payload: e.candidate,
                        sender: username,
                    })
                );
            }
        };

        // 3) When a remote track arrives, use lastSignalSender to identify whose it is
        pc.current.ontrack = (e) => {
            const stream = e.streams[0];
            const peer = lastSignalSender.current;
            if (peer && peer !== username) {
                onRemoteStream(peer, stream);
            }
            // also attach to the small local preview <video>
            if (remoteVid.current && !remoteVid.current.srcObject) {
                remoteVid.current.srcObject = stream;
            }
        };

        // 4) Get local media and add to peer
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVid.current.srcObject = stream;
                stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
            })
            .catch(console.error);

        return () => {
            pc.current.close();
            ws.current.close();
        };
    }, [roomId, username, onRemoteStream]);

    return (
        <Box sx={{ mb: 2 }}>
            <Button
                variant="contained"
                onClick={() => {
                    if (!pc.current.localDescription) {
                        pc.current.createOffer().then((offer) => {
                            pc.current.setLocalDescription(offer);
                            ws.current.send(
                                JSON.stringify({ type: "webrtc_offer", payload: offer, sender: username })
                            );
                        });
                    }
                }}
                sx={{ mb: 1 }}
            >
                Start Call
            </Button>
            <Stack direction="row" spacing={1}>
                <video
                    ref={localVid}
                    autoPlay
                    muted
                    style={{ width: 100, borderRadius: 4 }}
                />
                <video
                    ref={remoteVid}
                    autoPlay
                    style={{ width: 100, borderRadius: 4 }}
                />
            </Stack>
        </Box>
    );
}
