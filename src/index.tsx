/**
 * ================================================================
 * APPLICATION ENTRY POINT
 * ================================================================
 * Initializes React application and renders main App component
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/App.css';

// Initialize React application
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Please ensure index.html contains a div with id="root"');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
