import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Stations from '@/pages/Stations';
import Nodes from '@/pages/Nodes';
import Users from '@/pages/Users';
import Dispatch from '@/pages/Dispatch';
import Monitor from '@/pages/Monitor';
import Emergency from '@/pages/Emergency';
import Repair from '@/pages/Repair';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/users" element={<Users />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
