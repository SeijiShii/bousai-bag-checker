import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './routes/App';
import { BackendProvider, makeMemoryBackend } from './services/backend';
import './styles/globals.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root が見つかりません');

// dev/デモは keyless memory backend (seed 付き)。Phase D で env により httpBackend に切替。
const backend = makeMemoryBackend({ seed: true });

createRoot(el).render(
  <React.StrictMode>
    <BackendProvider backend={backend}>
      <App />
    </BackendProvider>
  </React.StrictMode>,
);
