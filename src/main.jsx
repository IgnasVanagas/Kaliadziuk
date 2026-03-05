import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './i18n';
import AppRouter from './router.jsx';
import './index.css';
import { AuthProvider } from './auth/AuthProvider.jsx';
import SiteMetrics from './components/SiteMetrics.jsx';
import ConsentBanner from './components/ConsentBanner.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SiteMetrics />
        <ConsentBanner />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
