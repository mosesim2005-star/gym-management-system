import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { isAuthenticated } from './utils/auth';
import { globalCSS } from './styles/shared.styles';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ActiveMembers from './pages/ActiveMembers';
import AddMembers from './pages/AddMembers';
import MembershipRevenue from './pages/MembershipRevenue';
import ExpiredMembers from './pages/ExpiredMembers';
import TotalMembers from './pages/TotalMembers';                    // ← direct import now
import { MembershipRenewalRate } from './pages/PlaceholderPages';  // ← only this from Placeholder

const GlobalStyles: React.FC = () => {
  useEffect(() => {
    const styleId = 'gym-global-styles';
    if (!document.getElementById(styleId)) {
      const tag = document.createElement('style');
      tag.id = styleId;
      tag.innerHTML = globalCSS;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/total-members" element={<ProtectedRoute><TotalMembers /></ProtectedRoute>} />
          <Route path="/active-members" element={<ProtectedRoute><ActiveMembers /></ProtectedRoute>} />
          <Route path="/expired-members" element={<ProtectedRoute><ExpiredMembers /></ProtectedRoute>} />
          <Route path="/membership-revenue" element={<ProtectedRoute><MembershipRevenue /></ProtectedRoute>} />
          <Route path="/add-members" element={<ProtectedRoute><AddMembers /></ProtectedRoute>} />
          <Route path="/membership-renewal-rate" element={<ProtectedRoute><MembershipRenewalRate /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;