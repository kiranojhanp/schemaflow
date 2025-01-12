import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Home } from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";

import "@xyflow/react/dist/base.css";
import "@xyflow/react/dist/style.css";
import "@/index.css";

import "@/global"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
    <Toaster />
  </StrictMode>
);
