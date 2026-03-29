import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './i18n.js';
import './index.css';

// Apply saved language direction on load
const savedLang = localStorage.getItem('sahtech_lang') || 'fr';
document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', savedLang);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
