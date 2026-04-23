import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from 'app/App';
import 'styles/tokens.css';
import 'styles/react-app.css';

// Polyfill DOMMatrix for older iOS browsers or restricted webviews (like WhatsApp in-app browser)
// which pdf.js depends on, avoiding "DOMMatrix is not defined" crashes.
if (typeof window !== 'undefined' && typeof window.DOMMatrix === 'undefined') {
  // @ts-ignore
  window.DOMMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix || class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: string | number[]) {
      if (Array.isArray(init) && init.length === 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      }
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
