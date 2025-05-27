// src/RoomPage.jsx
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import {
    AppBar,
    Container,
    CssBaseline,
    Grid,
    Box,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CanvasWhiteboard from "./canvas";
import UserList from "./userList";
import VideoChat from "./VideoChat";
import { ThemeContext } from "../components/themeCtx";

export default function RoomPage() {
    const { roomId } = useParams();
    const { token, user, logout } = useContext(AuthContext);
    const { mode, toggleMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Room: {roomId}
                    </Typography>

                    <Box sx={{ mr: 2 }}>
                        <Typography variant="body1">
                            {user?.username || "Guest"}
                        </Typography>
                    </Box>

                    <IconButton color="inherit" onClick={toggleMode}>
                        {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
                    </IconButton>

                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                    <Grid item size={{ xs: 12, md: 3 }} >
                        <UserList roomId={roomId} username={user.username} />
                        <VideoChat roomId={roomId} username={user.username} />
                    </Grid>
                    <Grid item size={{ xs: 12, md: 9 }}>
                        <CanvasWhiteboard
                            roomId={roomId}
                            username={user.username}
                            token={token}
                        />
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
