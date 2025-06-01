import { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Button,
  IconButton,
  Slider,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";

export default function CanvasWhiteboard({ roomId, username, token }) {
  const canvasRef = useRef(null);
  const ws = useRef(null);
  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState("#000000");

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [events, setEvents] = useState([]);

  const lastPointRef = useRef(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    // Use devicePixelRatio to keep it crisp
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
  };

  useEffect(() => {
    // Initial size
    resizeCanvas();
    // Resize on window change
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);


  const drawLine = (ctx, from, to, color, size) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const redrawAll = (stack) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (let ev of stack) {
      drawLine(ctx, ev.from, ev.to, ev.color, ev.size);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    fetch(`http://localhost:8000/api/rooms/${roomId}/canvas/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const strokes = data.data || [];
        for (let ev of strokes) {
          drawLine(ctx, ev.from, ev.to, ev.color, ev.size);
        }
        setEvents(strokes);
        setUndoStack(strokes);
      });

    ws.current = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: "join", username }));
    };

    ws.current.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === "draw") {
        const ev = msg;
        const ctx = canvas.getContext("2d");
        drawLine(ctx, ev.from, ev.to, ev.color, ev.size);
        setUndoStack((u) => [...u, ev]);
        setEvents((e) => [...e, ev]);
        setRedoStack([]);
      }
    };

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e) => {
      lastPointRef.current = getPos(e);
    };

    const handleMouseUp = () => {
      lastPointRef.current = null;
    };

    const handleMouseMove = (e) => {
      if (e.buttons !== 1 || !lastPointRef.current) return;
      const newPoint = getPos(e);
      const ctx = canvas.getContext("2d");

      const ev = {
        from: lastPointRef.current,
        to: newPoint,
        color,
        size: brushSize,
        type: "draw",
        username,
      };

      drawLine(ctx, ev.from, ev.to, ev.color, ev.size);
      ws.current.send(JSON.stringify(ev));
      setUndoStack((u) => [...u, ev]);
      setEvents((e) => [...e, ev]);
      setRedoStack([]);

      lastPointRef.current = newPoint;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      ws.current?.close();
    };
  }, [roomId, username, token, brushSize, color]);

  const handleUndo = () => {
    const newUndo = [...undoStack];
    const last = newUndo.pop();
    if (!last) return;
    setUndoStack(newUndo);
    setRedoStack((r) => [...r, last]);
    redrawAll(newUndo);
    setEvents(newUndo);
  };

  const handleRedo = () => {
    const newRedo = [...redoStack];
    const last = newRedo.pop();
    if (!last) return;
    const newUndo = [...undoStack, last];
    setUndoStack(newUndo);
    setRedoStack(newRedo);
    redrawAll(newUndo);
    setEvents(newUndo);
  };

  const handleClear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setUndoStack([]);
    setRedoStack([]);
    setEvents([]);
  };

  const handleSave = () => {
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
        alert("Saved!");
      })
      .catch((err) => alert(err.message));
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", p: 0 }} >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="subtitle1">Brush</Typography>
        <Slider
          value={brushSize}
          onChange={(e, v) => setBrushSize(v)}
          min={1}
          max={20}
          sx={{ width: 120 }}
        />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <Divider orientation="vertical" flexItem />
        <IconButton onClick={handleUndo} disabled={!undoStack.length}>
          <UndoIcon />
        </IconButton>
        <IconButton onClick={handleRedo} disabled={!redoStack.length}>
          <RedoIcon />
        </IconButton>
        <IconButton onClick={handleClear}>
          <ClearIcon />
        </IconButton>
        <IconButton onClick={handleSave}>
          <SaveIcon />
        </IconButton>
      </Stack>

      <canvas
        ref={canvasRef}
        style={{ border: "2px solid #ccc", borderRadius: 8, display: "block" }} />

    </Paper>
  );
}
