import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./routes/App";
import {
  BackendProvider,
  makeMemoryBackend,
  makeHttpBackend,
} from "./services/backend";
import "./styles/globals.css";

const el = document.getElementById("root");
if (!el) throw new Error("#root が見つかりません");

// 本番 (build) は /api/* を呼ぶ httpBackend。dev/E2E は keyless な seed 付き memory backend。
// VITE_BACKEND=http で dev でも http を強制可能 (api 結合確認用)。
const useHttp = import.meta.env.PROD || import.meta.env.VITE_BACKEND === "http";
const backend = useHttp ? makeHttpBackend() : makeMemoryBackend({ seed: true });

createRoot(el).render(
  <React.StrictMode>
    <BackendProvider backend={backend}>
      <App />
    </BackendProvider>
  </React.StrictMode>,
);
