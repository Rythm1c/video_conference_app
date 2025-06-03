import React from 'react'
import { CardContent, Typography, Box } from "@mui/material";

function VideoCard({ username, user, stream }) {
    return (
        <Box
            sx={{ position: "relative", borderRadius: 1, overflow: "hidden", height: 200 }}>
            {/* <CardHeader
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
                                        /> */}
            {stream ? (
                <video
                    autoPlay
                    muted={user === username}
                    ref={(el) => {
                        if (el && el.srcObject !== stream) {
                            el.srcObject = stream;
                        }
                    }}
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