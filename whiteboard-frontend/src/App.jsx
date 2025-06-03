import { Button, Box, Typography, Container, Stack } from "@mui/material";
import React from "react";
import { styled } from "@mui/system";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import TopBar from "./components/TopBar";

import { Link } from "react-router-dom";


const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundImage: 'url("https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  textAlign: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: -1,
  },
}));

export default function App() {
  return (
    <>
      <TopBar />
      <BackgroundBox>
        <Container maxWidth="sm">
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
    </>
  );
}
