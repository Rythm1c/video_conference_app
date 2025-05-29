// src/MainLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useContext } from "react";
import { ThemeContext } from "../components/themeCtx";
import { AuthContext } from "./AuthContext";

export default function MainLayout() {
    const { mode, toggleTheme } = useContext(ThemeContext);
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ color: "inherit", textDecoration: "none" }}
                    >
                        Whiteboard App
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton color="inherit" onClick={toggleTheme}>
                            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                        </IconButton>
                        {!token ? (
                            <>
                                <Button color="inherit" component={Link} to="/login">
                                    Login
                                </Button>
                                <Button color="inherit" component={Link} to="/register">
                                    Register
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ display: "inline", mr: 2 }}>
                                    {user?.username}
                                </Typography>
                                <Button color="inherit" onClick={() => { logout(); navigate("/"); }}>
                                    Logout
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Outlet />
        </>
    );
}
