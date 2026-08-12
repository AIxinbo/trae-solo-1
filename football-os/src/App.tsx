import { Routes, Route, Navigate } from 'react-router-dom'
import Overview from './pages/Overview.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Tactics from './pages/Tactics.tsx'
import Match from './pages/Match.tsx'
import Training from './pages/Training.tsx'
import Players from './pages/Players.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/dashboard" element={<Dashboard />} />
      <Route path="/app/tactics" element={<Tactics />} />
      <Route path="/app/match" element={<Match />} />
      <Route path="/app/training" element={<Training />} />
      <Route path="/app/players" element={<Players />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
