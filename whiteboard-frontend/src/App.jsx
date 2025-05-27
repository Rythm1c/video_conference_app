import { Button, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <Box sx={{ textAlign: "center", mt: 8, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4">Welcome to Whiteboard</Typography>
      <Button variant="contained" component={Link} to="/create-room">
        Create Room
      </Button>
      <Button variant="outlined" component={Link} to="/rooms">
        Browse Public Rooms
      </Button>
    </Box>
  );
}
