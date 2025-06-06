import React from 'react'
import { CardContent, Typography, Box } from "@mui/material";

function VideoCard({ username, user, stream }) {
    const videoRef = React.useRef(null);

    React.useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch(e =>
                console.error("Failed to play video:", e)
            );
        }

        return () => {
            if (videoElement) {
                videoElement.srcObject = null;
            }
        };
    }, [stream]);

    return (
        <Box
            sx={{ position: "relative", borderRadius: 0, overflow: "hidden", width: "100%", height: "100%" }}>

            {stream ? (
                <video
                    autoPlay
                    muted={user === username}
                    ref={videoRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                        backgroundColor: "#000",
                    }} />
            ) : (
                <Typography
                    color="textSecondary"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                        backgroundColor: "#000",
                    }}>
                    No video
                </Typography>
            )}

            <Box
                sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 4,
                }}>
                <Typography variant="caption">
                    {user === username ? `${user} (You)` : user}
                </Typography>
            </Box>
        </Box>);
}

export default VideoCard