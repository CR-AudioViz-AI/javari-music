// factory 2026-09-11: embed bridge for craudiovizai.com (framework-free; this is a Vite app)
import { startEmbed } from '@craudioviz/platform-sdk/lib/embed/start'
startEmbed()
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
