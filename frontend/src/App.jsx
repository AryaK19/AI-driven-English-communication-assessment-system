import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Footer from './components/layout/Footer';
import Dashboard from './components/pages/Dashboard';
import Video from './components/pages/Video';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/video" element={<Video />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;