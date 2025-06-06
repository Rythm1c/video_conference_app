import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function Register() {
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(username, password);
            navigate("/");  // or redirect to a dashboard
        } catch (err) {
            setError(err.response?.data?.errors || "Registration failed");
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                mt: 8,
                mx: "auto",
                width: 320,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }} >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: 'skyblue',
                    padding: 1
                }}
                onHover={{ cursor: 'pointer' }}>
                <Button variant="h4" onClick={() => navigate('/')} sx={{ fontWeight: 'bold' }}>
                    Whiteboard
                </Button>
            </Box>
            <Typography variant="h5" align="center">
                Register
            </Typography>

            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <TextField
                label="Confirm Password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
            />

            {error && (
                <Typography color="error" variant="body2">
                    {typeof error === "string"
                        ? error
                        : Object.values(error).flat().join(" ")}
                </Typography>
            )}

            <Button variant="contained" type="submit">
                Sign Up
            </Button>

            <Typography variant="body2" align="center">
                Already have an account?{" "}
                <RouterLink to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
                    Log in
                </RouterLink>
            </Typography>
        </Box>
    );
}
