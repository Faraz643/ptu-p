import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="772993112256-7h9249ganirq97a54e3t97ovja85lftt.apps.googleusercontent.com">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);