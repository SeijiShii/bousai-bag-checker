import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './routes/App';
import './styles/globals.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root が見つかりません');

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
