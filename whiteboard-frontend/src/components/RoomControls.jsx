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
import CreateIcon from '@mui/icons-material/Create';
import EditOffIcon from '@mui/icons-material/EditOff';

export default function RoomControls({ streamRef, canvasOpen, setCanvasOpen, onLeave, chatOpen, setChatOpen }) {
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
            <Box
                sx={{
                    width: "100%",
                    py: 2,
                    gap: 2,
                    bgcolor: "background.paper",
                    borderTop: "1px solid #ccc",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: 'grey.800',
                    zIndex: 10,
                }}>

                <Tooltip title={canvasOpen ? "Hide Canvas" : "Show Canvas"}>
                    <IconButton onClick={() => setCanvasOpen((prev) => !prev)}>
                        {canvasOpen ? <CreateIcon /> : <EditOffIcon />}
                    </IconButton>
                </Tooltip>

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
            </Box>

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
