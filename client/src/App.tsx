import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SocketTest from './components/SocketTest'

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planning Poker</h1>
        <p className="text-gray-600 mb-6">React frontend placeholder - Phase 1 complete!</p>
        <Link 
          to="/test" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Socket.io Test
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<SocketTest />} />
      </Routes>
    </Router>
  )
}

export default App