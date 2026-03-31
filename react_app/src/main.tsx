import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from 'app/App';
import 'styles/tokens.css';
import 'styles/globals.css';
import 'styles/layout.css';
import 'styles/components.css';
import 'styles/mobile.css';
import 'styles/modal.css';
import 'styles/public.css';
import 'styles/dashboard.css';
import 'styles/resumes.css';
import 'styles/editor.css';
import 'styles/jds.css';
import 'styles/profile.css';
import 'styles/react-app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
