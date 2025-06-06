import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mx: 'auto', mt: 8, width: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Typography variant="h5" align="center">Log In</Typography>
            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained">Login</Button>
            <Typography align="center" variant="body2">
                Don’t have an account? <RouterLink to="/register">Register</RouterLink>
            </Typography>
        </Box>
    );
}
