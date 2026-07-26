import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Lightweight deterrent for devtools shortcuts and right-click
if (import.meta.env.PROD) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') e.preventDefault();
    // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    // Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) e.preventDefault();
    // Ctrl+Shift+C (Windows/Linux) or Cmd+Option+C (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) e.preventDefault();
    // Ctrl+U (Windows/Linux) or Cmd+Option+U (Mac)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
