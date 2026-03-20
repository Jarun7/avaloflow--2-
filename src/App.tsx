import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FlowsLibrary } from './pages/FlowsLibrary';
import { Audiences } from './pages/Audiences';
import { Settings } from './pages/Settings';
import { FlowBuilder } from './pages/FlowBuilder';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Activity } from './pages/Activity';
import { Templates } from './pages/Templates';
import { Library } from './pages/Library';
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<FlowsLibrary />} />
            <Route path="/audiences" element={<Audiences />} />
            <Route path="/automations" element={<FlowBuilder />} />
            <Route path="/automations/:id" element={<FlowBuilder />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/library" element={<Library />} />
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
