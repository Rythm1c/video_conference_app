import { useEffect, useRef, useState } from "react";
import { Box, Button, Stack } from "@mui/material";

export default function VideoChat({ roomId, username }) {
    const localVid = useRef();
    const remoteVid = useRef();
    const pc = useRef();
    const ws = useRef();

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);
        ws.current.onmessage = async (e) => {
            const msg = JSON.parse(e.data);
            const { type, payload, sender } = msg;

            if (type === "webrtc_offer" && sender !== username) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                ws.current.send(JSON.stringify({
                    type: "webrtc_answer",
                    payload: answer,
                    sender: username
                }));
            }

            if (type === "webrtc_answer" && sender !== username) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            }

            if (type === "webrtc_candidate" && sender !== username) {
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(payload));
                } catch (e) { console.error(e); }
            }

            if (type === "start_call" && !pc.current.localDescription) {
                // first time you’re told to start
                const offer = await pc.current.createOffer();
                await pc.current.setLocalDescription(offer);
                ws.current.send(JSON.stringify({
                    type: "webrtc_offer",
                    payload: offer,
                    sender: username,
                }));
            }
        };

        // Setup RTCPeerConnection
        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                ws.current.send(JSON.stringify({
                    type: "webrtc_candidate",
                    payload: e.candidate,
                    sender: username
                }));
            }
        };

        pc.current.ontrack = (e) => {
            if (remoteVid.current.srcObject !== e.streams[0]) {
                remoteVid.current.srcObject = e.streams[0];
            }
        };

        // Get local media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVid.current.srcObject = stream;
                stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
            })
            .catch(console.error);

        return () => {
            pc.current.close();
            ws.current.close();
        };
    }, [roomId, username]);

    // Only the first user to click this will create the offer
    const startCall = async () => {
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        ws.current.send(JSON.stringify({
            type: "webrtc_offer",
            payload: offer,
            sender: username
        }));
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} mb={2}>
                <Button variant="contained" onClick={startCall}>
                    Start Call
                </Button>
            </Stack>
            <Stack direction="row" spacing={2}>
                <video ref={localVid} autoPlay muted style={{ width: 200, borderRadius: 8 }} />
                <video ref={remoteVid} autoPlay style={{ width: 200, borderRadius: 8 }} />
            </Stack>
        </Box>
    );
}
