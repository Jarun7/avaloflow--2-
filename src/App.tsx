import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Settings } from './pages/Settings';
import { AutoDM } from './pages/AutoDM';
import { Analytics } from './pages/Analytics';
import { Support } from './pages/Support';
import { Billing } from './pages/Billing';
import { NotFound } from './pages/NotFound';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<AutoDM />} />
            <Route path="/autodm" element={<Navigate to="/" replace />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
          toastOptions={{
            style: { borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
          }}
        />
      </ErrorBoundary>
    </Router>
  );
}
