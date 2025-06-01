import {
    Box,
    IconButton,
    Paper,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function RoomControls({ streamRef, onLeave, chatOpen, setChatOpen }) {
    const navigate = useNavigate();
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);

    const toggleMic = () => {
        const stream = streamRef.current;
        if (stream) {
            stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
            setMicOn((prev) => !prev);
        }
    };

    const toggleCam = () => {
        const stream = streamRef.current;
        if (stream) {
            stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
            setCamOn((prev) => !prev);
        }
    };

    const handleLeaveConfirm = () => {
        if (onLeave) onLeave();
        navigate("/");
    };

    return (
        <>
            <Paper
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    py: 1,
                    px: 2,
                    bgcolor: "background.paper",
                    borderTop: "1px solid #ccc",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 10,
                }}

            >
                <Box>
                    <Tooltip title={chatOpen ? "Hide Chat" : "Show Chat"}>
                        <IconButton onClick={() => setChatOpen((prev) => !prev)}>
                            {chatOpen ? <ChatIcon /> : <ChatBubbleOutlineIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title={micOn ? "Mute" : "Unmute"}>
                    <IconButton onClick={toggleMic}>
                        {micOn ? <MicIcon /> : <MicOffIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={camOn ? "Turn Off Camera" : "Turn On Camera"}>
                    <IconButton onClick={toggleCam}>
                        {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Leave Room">
                    <IconButton color="error" onClick={() => setOpenConfirm(true)}>
                        <ExitToAppIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Leave Room</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to leave the room?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button onClick={handleLeaveConfirm} color="error">
                        Leave
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
