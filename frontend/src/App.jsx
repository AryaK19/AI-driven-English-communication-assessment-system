import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dashboard } from "./pages/Dashboard";
import { GrammarAssessment, FeedbackPage, AssessmentSetup } from "./pages/Assessment";
import { Login, Register } from "./pages/authentication";
import { Home } from "./pages/Home";
import { Navbar, PrivateRoute, LoadingScreen } from "./components";


function App() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserAuthenticated(true);
      } else {
        setIsUserAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar isUserAuthenticated={isUserAuthenticated} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute isAuthenticated={isUserAuthenticated}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/assessment/setup"
              element={
                <PrivateRoute isAuthenticated={isUserAuthenticated}>
                  <AssessmentSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/assessment/grammar"
              element={
                <PrivateRoute isAuthenticated={isUserAuthenticated}>
                  <GrammarAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/assessment/feedback"
              element={
                <PrivateRoute isAuthenticated={isUserAuthenticated}>
                  <FeedbackPage />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;