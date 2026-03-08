import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import AssetsPage from './pages/Assets';
import './App.css';
import AgentStudio from "./pages/AgentStudio";
import { Show } from "@clerk/react";
import SignedOutLanding from "./components/auth/SignedOutLanding";

function App() {
  return (
    <Router>

      <Show when="signed-out">
        <SignedOutLanding />
      </Show>

      <Show when="signed-in">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/agent" element={<AgentStudio />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Show>

    </Router>
  );
}

export default App;
