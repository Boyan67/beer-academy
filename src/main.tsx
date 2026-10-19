import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";

import App from "./App";

// Ask the browser not to evict progress under storage pressure. No-op if it says no.
navigator.storage?.persist?.();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
