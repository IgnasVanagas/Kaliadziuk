import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';
import AppRouter from './router.jsx';
import './index.css';
import { AuthProvider } from './auth/AuthProvider.jsx';
import GoogleAnalytics from './components/GoogleAnalytics.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <GoogleAnalytics />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
