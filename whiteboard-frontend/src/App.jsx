import { Link } from "react-router-dom";
import { Button, Container, CssBaseline, Typography } from "@mui/material";

function App() {
  return (
    <>
      <CssBaseline />
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Whiteboard Demo
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/room/DEMO123"
        >
          Join Room DEMO123
        </Button>
      </Container>
    </>
  );
}

export default App;