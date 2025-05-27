import { useEffect, useRef, useState } from "react";
import { Box, Slider, Typography, Stack, Button } from "@mui/material";

export default function CanvasWhiteboard({ roomId, username, token }) {
  const canvasRef = useRef(null);
  const ws = useRef(null);

  // Brush settings
  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState("#000000");

  // Buffer of all draw events for persistence
  const [events, setEvents] = useState([]);

  // Replay and WebSocket setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 1) Fetch saved events from backend
    fetch(`http://localhost:8000/api/rooms/${roomId}/canvas/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        data.data.forEach((ev) => {
          ctx.fillStyle = ev.color;
          ctx.beginPath();
          ctx.arc(ev.x, ev.y, ev.size, 0, 2 * Math.PI);
          ctx.fill();
        });
        // Initialize our buffer with what’s on the server
        setEvents(data.data);
      })
      .catch(console.error);

    // 2) WebSocket join
    const wsUrl = `ws://localhost:8000/ws/room/${roomId}/`;
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: "join", username }));
    };
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "draw") {
        ctx.fillStyle = data.color;
        ctx.beginPath();
        ctx.arc(data.x, data.y, data.size, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    // 3) Local drawing handler
    const handleDraw = (e) => {
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ev = { type: "draw", x, y, color, size: brushSize };

      // Send to peers
      ws.current.send(JSON.stringify(ev));
      // Draw locally
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
      ctx.fill();
      // Append to buffer
      setEvents((prev) => [...prev, ev]);
    };

    canvas.addEventListener("mousemove", handleDraw);
    return () => {
      canvas.removeEventListener("mousemove", handleDraw);
      ws.current.close();
    };
  }, [roomId, username, color, brushSize, token]);

  // Clear canvas locally and reset buffer
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setEvents([]);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `whiteboard_${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };


  // Save current buffer to backend
  const saveCanvas = () => {
    fetch(`http://localhost:8000/api/rooms/${roomId}/canvas/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: events }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
      })
      .then(() => alert("Canvas saved!"))
      .catch((err) => alert(err.message));
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography>Size</Typography>
        <Slider
          value={brushSize}
          onChange={(e, v) => setBrushSize(v)}
          min={1}
          max={20}
          sx={{ width: 150 }}
        />
        <Typography>Color</Typography>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <Button variant="outlined" onClick={clearCanvas}>
          Clear
        </Button>
        <Button variant="contained" onClick={saveCanvas}>
          Save
        </Button>
        <Button variant="outlined" onClick={downloadImage}>
          Download PNG
        </Button>
      </Stack>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid #ccc", borderRadius: 8 }}
      />
    </Box>
  );
}
