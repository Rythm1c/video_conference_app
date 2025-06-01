// src/MainLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useContext } from "react";
import { ThemeContext } from "../components/themeCtx";
import { AuthContext } from "./AuthContext";
import TopBar from "../components/TopBar";

export default function MainLayout() {
    const { mode, toggleTheme } = useContext(ThemeContext);
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <>
            <TopBar />
            <Outlet />
        </>
    );
}
