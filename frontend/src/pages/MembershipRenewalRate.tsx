import React from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard: React.FC = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flex: 1, padding: 40, fontFamily: 'DM Sans, sans-serif' }}>
      <h1>Dashboard</h1>
      <p style={{ color: '#888' }}>Coming soon...</p>
    </main>
  </div>
);

export default Dashboard;