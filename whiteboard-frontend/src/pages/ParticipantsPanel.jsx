import { useEffect, useRef, useState, useContext } from "react";
import {
    Box,
    Typography,
} from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VideoCard from "../components/VideoCard";
import { RoomConnectionContext } from "../contexts/roomConnection";

export default function ParticipantsPanel({ canvasOpen, users, setUsers, roomId, username, localStream }) {
    const { subscribe, connected, sendMessage, pcs: pcsMap } = useContext(RoomConnectionContext);
    const pcs = useRef(pcsMap); // Use the pcs from context
    const [readyPeers, setReadyPeers] = useState(new Set());
    const [streams, setStreams] = useState({});
    const [status, setStatus] = useState({}); // { username: { mic: bool, cam: bool } }
    const [userRows, setUserRows] = useState([]);

    const updateStream = (user, stream) =>
        setStreams((prev) => ({ ...prev, [user]: stream }));

    const updateStatus = (user, mic, cam) =>
        setStatus((prev) => ({ ...prev, [user]: { mic, cam } }));

    const createPeerConnection = (peer) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        if (localStream.current) {
            console.log('Adding tracks to peer connection')
            localStream.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStream.current);
            });
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                sendMessage({
                    type: "webrtc_candidate",
                    sender: username,
                    target: peer,
                    payload: e.candidate,
                });
            }
        };

        pc.ontrack = (e) => {
            console.log('Received remote track', e.streams[0]);
            if (e.streams && e.streams[0]) {
                updateStream(peer, e.streams[0]);
            }
        };

        return pc;
    };

    useEffect(() => {
        if (!connected) return;

        const handle = async (msg) => {
            const { type, payload, sender, target } = msg;
            if (sender === username) return;

            switch (type) {
                case "user_list":
                    setUsers(msg.users);
                    break;
                case "media_status":
                    setStatus((prev) => ({ ...prev, [sender]: payload }));
                    break;
                case "webrtc_offer":
                    if (target !== username) return;
                    const offerPc = createPeerConnection(sender);
                    pcs.current.set(sender, offerPc);
                    await offerPc.setRemoteDescription(new RTCSessionDescription(payload));
                    const answer = await offerPc.createAnswer();
                    await offerPc.setLocalDescription(answer);
                    sendMessage({ type: "webrtc_answer", sender: username, target: sender, payload: answer });
                    break;
                case "webrtc_answer":
                    if (target !== username || !pcs.current.has(sender)) return;
                    await pcs.current.get(sender).setRemoteDescription(new RTCSessionDescription(payload));
                    break;
                case "webrtc_candidate":
                    if (target !== username || !pcs.current.has(sender)) return;
                    try {
                        await pcs.current.get(sender).addIceCandidate(new RTCIceCandidate(payload));
                    } catch (err) {
                        console.error("Failed to add ICE candidate", err);
                    }
                    break;
                default:
                    break;
            }
        };

        const unsubscribe = subscribe(handle);
        return unsubscribe;
    }, [connected, canvasOpen, username]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStream.current = stream;
                updateStream(username, stream);

                const micOn = stream.getAudioTracks()[0]?.enabled ?? true;
                const camOn = stream.getVideoTracks()[0]?.enabled ?? true;
                updateStatus(username, micOn, camOn);

                // Broadcast local status
                sendMessage(
                    {
                        type: "media_status",
                        sender: username,
                        payload: { mic: micOn, cam: camOn },
                    }
                );
            })
            .catch((error) => {
                console.error('Failed to get media stream:', error);
            });

        return () => {
            if (localStream.current) {
                localStream.current
                    .getTracks()
                    .forEach(track =>
                        track.stop());
                localStream.current = null;
            }
        };
    }, [localStream, canvasOpen, username]);

    useEffect(() => {
        if (!localStream.current) return;
        // Update local stream in streams object whenever layout changes
        updateStream(username, localStream.current);
    }, [canvasOpen, localStream.current, username]);

    // Create peer connections as users joinvideo_conference_app
    useEffect(() => {
        if (!localStream.current) return;
        if (!connected) return;
        if (users.length === 0) return;

        users.forEach((peer) => {
            if (peer === username || pcs.current.has(peer) || readyPeers.has(peer)) return;

            const pc = createPeerConnection(peer);
            pcs.current.set(peer, pc);

            pc.createOffer()
                .then((offer) => {
                    pc.setLocalDescription(offer);
                    sendMessage(
                        {
                            type: "webrtc_offer",
                            sender: username,
                            target: peer,
                            payload: offer,
                        }
                    );
                    setReadyPeers((prev) => new Set(prev).add(peer));
                })
                .catch(console.error);
        });

        return () => {
            pcs.current.forEach((pc) => pc.close());
            pcs.current.clear();
            setStreams({});
        };
    }, [users, username, canvasOpen, connected]);

    useEffect(() => {
        //if (canvasOpen) return;
        let rows = [];
        const MAX_PER_ROW = 6; // Adjust as needed for your layout
        for (let i = 0; i < users.length; i += MAX_PER_ROW) {
            rows.push(users.slice(i, i + MAX_PER_ROW));
        }
        setUserRows(rows);
    }, [users, canvasOpen]);



    return (
        <>
            {canvasOpen ?
                <Box
                    sx={{
                        height: "100%", width: "100vw",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 2,
                        overflowX: "auto",
                        border: "1px solid #ccc",
                        borderRadius: 0,
                        padding: 1
                    }}>
                    {users.map((u, i) => (
                        <Box
                            key={i}
                            sx={{
                                position: "relative",
                                borderRadius: 0,
                                overflow: "hidden",
                                width: 200, height: "100%", // 
                                flexShrink: 0 // Prevent shrinking 
                            }}>
                            <VideoCard
                                stream={streams[u]}
                                user={u}
                                username={username} />
                        </Box>
                    ))}
                </Box>
                :
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%", height: "100%",
                        border: "1px solid #ccc",
                        borderRadius: 0,
                        padding: 1
                    }}>

                    {
                        userRows.map((row, rowIndex) => (
                            <Box
                                key={rowIndex}
                                sx={{
                                    display: "flex",
                                    flexGrow: 1,
                                }}>
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
