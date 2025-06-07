import { useEffect, useRef, useState, useContext } from "react";
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
import PaletteIcon from '@mui/icons-material/Palette';
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import BrushIcon from '@mui/icons-material/Brush';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';

import { RoomConnectionContext } from "../contexts/roomConnection";

export default function CanvasWhiteboard({ chatOpen, roomId, username, token }) {
  const canvasRef = useRef(null);
  const { sendMessage, subscribe, connected } = useContext(RoomConnectionContext);

  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState("#000000");

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [events, setEvents] = useState([]);

  const lastPointRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleBrushClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBrushClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    // Get actual container size
    const displayWidth = parent.clientWidth;
    const displayHeight = parent.clientHeight;

    // Set canvas size taking pixel ratio into account
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Scale down the canvas CSS size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Scale the drawing context
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // Reset transform
    ctx.scale(dpr, dpr);

    // Redraw existing content after resize
    redrawAll(undoStack);
  };

  useEffect(() => {
    // Initial size
    resizeCanvas();
    const handleResize = () => {
      // Add small delay to ensure container size has updated
      setTimeout(resizeCanvas, 0);
    };
    // Resize on window change
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chatOpen, undoStack]);


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
    if (!connected) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load initial canvas state
    fetch(`http://localhost:8000/api/rooms/${roomId}/canvas/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const strokes = data.data || [];
        setEvents(strokes);
        setUndoStack(strokes);
        redrawAll(strokes);
      });

    // Handle incoming WebSocket messages
    const handle = (msg) => {
      if (msg.type === "draw" && msg.username !== username) {
        const ctx = canvasRef.current.getContext("2d");
        drawLine(ctx, msg.from, msg.to, msg.color, msg.size);
        setUndoStack((u) => [...u, msg]);
        setEvents((e) => [...e, msg]);
        setRedoStack([]);
      }
    };
    const unsubscribe = subscribe(handle);
    return unsubscribe;
  }, [connected, roomId, token, username]);

  useEffect(() => {
    const canvas = canvasRef.current;

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

      const drawEvent = {
        type: "draw",
        from: lastPointRef.current,
        to: newPoint,
        color,
        size: brushSize,
        username, // Add username to identify who drew
      };

      // Draw locally
      drawLine(ctx, drawEvent.from, drawEvent.to, drawEvent.color, drawEvent.size);

      // Send to server
      sendMessage(drawEvent);

      // Update stacks
      setUndoStack((u) => [...u, drawEvent]);
      setEvents((e) => [...e, drawEvent]);
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

    };
  }, [username, brushSize, color]);

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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // Clear the entire canvas accounting for pixel ratio
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

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
    <Box sx={{
      border: "1px solid #ccc",
      flexGrow: 1,
      p: 1,
      display: "flex",
      flexDirection: "row",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      gap: 1,
    }} >
      <Box sx={{ p: 0, bgcolor: "grey.800" }}>
        <Stack direction="column" spacing={1} alignItems="center" mb={2}>
          <Tooltip title="Brush Size">
            <IconButton onClick={handleBrushClick}>
              <BrushIcon />
            </IconButton>
          </Tooltip>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleBrushClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Box sx={{ p: 2, width: 120 }}>
              <Typography variant="subtitle2" gutterBottom>
                Brush Size: {brushSize}
              </Typography>
              <Slider
                value={brushSize}
                onChange={(e, v) => setBrushSize(v)}
                min={1}
                max={20}
              />
            </Box>
          </Popover>

          <Tooltip title="Color">
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '0',
                  height: '0',
                  padding: '0',
                  border: 'none',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <IconButton
                sx={{
                  color: color,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
                onClick={() => document.querySelector('input[type="color"]').click()}
              >
                <PaletteIcon />
              </IconButton>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" flexItem />
          <Tooltip title="Undo">
            <IconButton onClick={handleUndo} disabled={!undoStack.length}>
              <UndoIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Redo">
            <IconButton onClick={handleRedo} disabled={!redoStack.length}>
              <RedoIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear Canvas">
            <IconButton onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Save Canvas">
            <IconButton onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>


      <Box
        sx={{
          p: 0,
          width: "100%",
          height: "100%",
          position: "relative",
          border: "1px solid #ccc",
          borderRadius: 1,
        }}>
        <canvas
          ref={canvasRef}
          style={{

            position: "absolute", // Position canvas absolutely
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }} />
      </Box>

    </Box >
  );
}
