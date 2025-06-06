import { Button, Box, Typography, Container, Stack } from "@mui/material";
import React from "react";
import { styled, keyframes } from "@mui/system";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import TopBar from "./components/TopBar";

import { Link } from "react-router-dom";

const floatSquares = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
  50% { transform: translate(-20px, -20px) rotate(180deg); opacity: 0.4; }
  100% { transform: translate(0, 0) rotate(360deg); opacity: 0.8; }
`;

const colorShift = keyframes`
  0% { background-color: rgba(138, 43, 226, 0.3); }
  25% { background-color: rgba(30, 144, 255, 0.3); }
  50% { background-color: rgba(72, 61, 139, 0.3); }
  75% { background-color: rgba(123, 104, 238, 0.3); }
  100% { background-color: rgba(138, 43, 226, 0.3); }
`;

const AnimatedSquares = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  zIndex: -2,
  '& div': {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    animation: `${floatSquares} 10s ease-in-out infinite, ${colorShift} 15s linear infinite`,
  },
}));

const twinkle = keyframes`
  0% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
  100% { opacity: 0.2; transform: scale(1); }
`;

const StarField = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  zIndex: -1,
  '& div': {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: '#fff',
    opacity: 0.3,
    animation: `${twinkle} 3s ease-in-out infinite`,
  },
}));
const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#0b0c2a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  textAlign: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
}));

export default function App() {

  const stars = Array.from({ length: 100 }).map((_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    const delay = Math.random() * 3;
    return (
      <div
        key={i}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  const squares = Array.from({ length: 30 }).map((_, i) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 10;
    const size = 10 + Math.random() * 60;
    return (
      <div
        key={i}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return (
    <Box sx={{ bgcolor: 'grey.900', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <TopBar />
      <BackgroundBox sx={{}}>
        <AnimatedSquares>
          {squares}
        </AnimatedSquares>
        <StarField>
          {stars}
        </StarField>
        <Container maxWidth="sm" sx={{}} >
          <Typography variant="h2" gutterBottom>
            Welcome to Whiteboard
          </Typography>
          <Typography variant="h6" gutterBottom>
            Real-time collaboration with video chat and shared canvas. Jump right in.
          </Typography>
          <Stack direction="column" spacing={2} mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              endIcon={<ArrowForwardIcon />} component={Link} to="/create-room">
              Create Room
            </Button>
            <Button variant="outlined"
              color="inherit"
              size="large"
              startIcon={<SearchIcon />}
              component={Link} to="/rooms">
              Browse Rooms
            </Button>
          </Stack>
        </Container>
      </BackgroundBox>
    </Box>
  );
}
