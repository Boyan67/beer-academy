import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-sans/cyrillic-400.css";
import "@fontsource/noto-sans/cyrillic-600.css";
import "@fontsource/noto-sans/cyrillic-700.css";
import "@fontsource/noto-sans/cyrillic-800.css";
import "@fontsource/noto-sans/latin-400.css";
import "@fontsource/noto-sans/latin-600.css";
import "@fontsource/noto-sans/latin-700.css";
import "@fontsource/noto-sans/latin-800.css";
import "./index.css";

import App from "./App";

// Ask the browser not to evict progress under storage pressure. No-op if it says no.
navigator.storage?.persist?.();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
