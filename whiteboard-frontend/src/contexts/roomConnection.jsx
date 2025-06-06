import { createContext, useEffect, useRef, useState } from "react";

export const RoomConnectionContext = createContext();

export default function RoomConnectionProvider({ roomId, username, children }) {
  const ws = useRef(null);
  const pcs = useRef(new Map());
  const [connected, setConnected] = useState(false);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const subscribers = useRef(new Set());

  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("[WS] Received:", msg);
      subscribers.current.forEach((cb) => cb(msg));
    } catch (err) {
      console.error("Invalid WebSocket message:", err);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    const connect = () => {
      if (!isSubscribed) return;
      if (ws.current?.readyState === WebSocket.OPEN) return;
      if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        return;
      }

      try {
        if (ws.current) ws.current.close();
        const socket = new WebSocket(`ws://localhost:8000/ws/room/${roomId}/`);
        ws.current = socket;

        socket.onopen = () => {
          if (!isSubscribed) return;
          console.log('WebSocket connected');
          setConnected(true);
          reconnectAttempts.current = 0;
          socket.send(JSON.stringify({ type: "join", username }));
        };

        socket.onmessage = handleMessage;

        socket.onclose = (e) => {
          if (!isSubscribed) return;
          console.warn("WebSocket closed:", e.code, e.reason);
          setConnected(false);
          if (e.code !== 1000 && isSubscribed) {
            reconnectAttempts.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            reconnectTimeout.current = setTimeout(connect, delay);
          }
        };

        socket.onerror = (error) => {
          if (!isSubscribed) return;
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        if (!isSubscribed) return;
        console.error('Failed to create WebSocket:', error);
        setConnected(false);
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close(1000, "Component unmounting");
        ws.current = null;
      }
      setConnected(false);
    };
  }, [roomId, username]);

  const sendMessage = (msg) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(msg));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const subscribe = (callback) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  };

  return (
    <RoomConnectionContext.Provider
      value={{ ws: ws.current, pcs: pcs.current, sendMessage, connected, roomId, username, subscribe }}
    >
      {children}
    </RoomConnectionContext.Provider>
  );
}
