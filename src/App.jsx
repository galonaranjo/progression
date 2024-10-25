import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import Login from "./components/Login";
import { initializeGoogleAuth, signIn, signOut } from "./api/auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await initializeGoogleAuth();
      const token = localStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleLoginSuccess = async () => {
    try {
      await signIn();
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="bg-white">
        {isLoggedIn && <Navbar onLogout={handleLogout} />}
        <main className="mt-4">
          {!isLoggedIn ? (
            <Login onSuccess={handleLoginSuccess} />
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
