// Node imports
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Styling
import "./styles/resets.css.js";            // vanilla-extract reset
import "bootstrap/dist/css/bootstrap.min.css";

// App
import App from "./App.jsx";

// Cursor (local file)
import {
  ReactiveCursorProvider,
  ReactiveCursor,
  CursorEffectsToggle,
} from "./reactive-cursor/ReactiveCursor.jsx"; // <— create this file (see notes below)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReactiveCursorProvider>
      {/* The custom cursor itself */}
      <ReactiveCursor
        hoverEffect={{ type: "scale", amount: 2 }}
        hoverTargets={{
          cursorPointer: true, // triggers on links/buttons etc.
          // You can add manual hooks too:
          // selectors: ["[data-cursor-hover]", "a", "button"],
          // excludeSelectors: ["[data-cursor-ignore]"],
        }}
      />

      {/* A11y toggle button (Bootstrap utility classes for placement) */}
      <div className="position-fixed end-0 bottom-0 p-3" style={{ zIndex: 10000 }}>
        <CursorEffectsToggle
          onLabel="Cursor effects on"
          offLabel="Cursor effects off"
          className="btn btn-dark"
        />
      </div>

      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReactiveCursorProvider>
  </StrictMode>
);
