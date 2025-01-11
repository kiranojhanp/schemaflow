import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Home } from "@/pages/Home";
import "@/index.css";

import "@/global"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>
);
