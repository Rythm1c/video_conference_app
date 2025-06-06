import React from 'react';
import { useContext } from "react";
import { ThemeContext } from "../contexts/themeCtx";
import { AuthContext } from "../contexts/AuthContext";

import {
    AppBar,
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    Button,
    Divider,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


function TopBar() {
    const { mode, toggleTheme } = useContext(ThemeContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="h6" onClick={() => navigate("/")}>Whiteboard</Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                    {token ?
                        <>
                            <Typography variant="body1">
                                {user?.username}
                            </Typography>
                            <Button onClick={handleMenuOpen}>
                                <Avatar alt={user?.username} src="" />
                            </Button>

                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                sx={{ '& .MuiMenu-list': { display: 'flex', flexDirection: 'column', alignItems: 'center' } }}>

                                <MenuItem onClick={toggleTheme}>
                                    <IconButton color="inherit" >
                                        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                                    </IconButton>
                                    {mode === "light" ? "light mode" : "dark mode"}
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => {
                                    handleMenuClose();
                                    logout();
                                    navigate("/");
                                }}
                                    sx={{ color: 'error.main' }}>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </> :
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar