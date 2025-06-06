import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import { AuthProvider, AuthContext } from "./contexts/AuthContext.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import ListRooms from "./pages/ListRooms.jsx";
import CreateRoom from "./forms/CreateRoom.jsx";
import ThemeManager from "./contexts/themeCtx.jsx";
import "./index.css";

function RequireAuth({ children }) {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeManager>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-room" element={<RequireAuth><CreateRoom /></RequireAuth>} />
            <Route path="/rooms" element={<RequireAuth><ListRooms /></RequireAuth>} />
            <Route path="/room/:roomId" element={<RequireAuth><RoomPage /></RequireAuth>} />
          </Routes>
        </AuthProvider>
      </ThemeManager>
    </BrowserRouter>
  </React.StrictMode>
);
