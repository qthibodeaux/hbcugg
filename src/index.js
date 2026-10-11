import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/palette.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyStoredScheme } from './theme/colorScheme';

// Light / Night: set data-theme on <html> before the first paint.
applyStoredScheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
