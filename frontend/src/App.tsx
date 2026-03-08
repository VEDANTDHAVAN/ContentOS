import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import AssetsPage from './pages/Assets';
import './App.css';
import AgentStudio from "./pages/AgentStudio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/agent" element={<AgentStudio />} />
      </Routes>
    </Router>
  );
}

export default App;
