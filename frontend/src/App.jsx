import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./pages/Home";

import { Dashboard } from "./pages/Dashboard/index";
import { GrammarAssessment } from "./pages/Assessment";
// import { Login, Register } from "./pages/authentication";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* SAKSHAM ADD ROUTING FOR THIS PAGES  */}
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessments" element={<GrammarAssessment />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;
