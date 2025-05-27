// src/ThemeContext.jsx
import { createContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState("light");
    const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleMode }}>
            <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
        </ThemeContext.Provider>
    );
}
