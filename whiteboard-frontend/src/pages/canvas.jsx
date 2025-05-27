import { useEffect, useRef, useState } from "react";
import {
  Box,
  Slider,
  Typography,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

export default function CanvasWhiteboard({ roomId, username, token }) {
  const canvasRef = useRef(null);
  const ws = useRef(null);

  // Brush settings
  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState("#000000");

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Buffer all events for persistence
  const [events, setEvents] = useState([]);

  // Draw helper
  const drawEvent = (ctx, ev) => {
    ctx.fillStyle = ev.color;
    ctx.beginPath();
    ctx.arc(ev.x, ev.y, ev.size, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Clear & replay a given stack
  const redrawAll = (stack) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stack.forEach((ev) => drawEvent(ctx, ev));
  };

  // Setup: fetch saved, open WS, attach draw handler
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Fetch saved events
    fetch(`http://localhost:8000/api/rooms/${roomId}/canvas/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        data.data.forEach((ev) => drawEvent(ctx, ev));
        setEvents(data.data);
        setUndoStack(data.data);
        setRedoStack([]);
      })
      .catch(console.error);

    // WebSocket
    ws.current = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: "join", username }));
    };
    ws.current.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === "draw") {
        const ev = { x: msg.x, y: msg.y, color: msg.color, size: msg.size };
        drawEvent(ctx, ev);
        setEvents((e) => [...e, ev]);
        setUndoStack((u) => [...u, ev]);
        setRedoStack([]); // clear redo when a new event arrives
      }
    };

    // Local drawing
    const handleDraw = (e) => {
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ev = { x, y, color, size: brushSize };

      // Send
      ws.current.send(JSON.stringify({ type: "draw", ...ev }));
      // Draw
      drawEvent(ctx, ev);
      // Update stacks
      setEvents((evs) => [...evs, ev]);
      setUndoStack((u) => [...u, ev]);
      setRedoStack([]);
    };

    canvas.addEventListener("mousemove", handleDraw);
    return () => {
      canvas.removeEventListener("mousemove", handleDraw);
      ws.current.close();
    };
  }, [roomId, username, color, brushSize, token]);

  // Undo handler
  const handleUndo = () => {
    if (!undoStack.length) return;
    const newUndo = undoStack.slice(0, -1);
    const last = undoStack[undoStack.length - 1];
    setUndoStack(newUndo);
    setRedoStack((r) => [...r, last]);
    redrawAll(newUndo);
    setEvents(newUndo);
  };

  // Redo handler
  const handleRedo = () => {
    if (!redoStack.length) return;
    const last = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newUndo = [...undoStack, last];
    setRedoStack(newRedo);
    setUndoStack(newUndo);
    redrawAll(newUndo);
    setEvents(newUndo);
  };

  // Clear everything
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);
    setEvents([]);
  };

  // Save as before...
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
        alert("Canvas saved!");
      })
      .catch((err) => alert(err.message));
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        {/* Undo/Redo */}
        <IconButton onClick={handleUndo} disabled={!undoStack.length}>
          <UndoIcon />
        </IconButton>
        <IconButton onClick={handleRedo} disabled={!redoStack.length}>
          <RedoIcon />
        </IconButton>

        {/* Brush controls */}
        <Typography>Size</Typography>
        <Slider
          value={brushSize}
          onChange={(e, v) => setBrushSize(v)}
          min={1}
          max={20}
          sx={{ width: 150 }}
        />
        <Typography>Color</Typography>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        {/* Clear/Save */}
        <Button variant="outlined" onClick={clearCanvas}>
          Clear
        </Button>
        <Button variant="contained" onClick={saveCanvas}>
          Save
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
