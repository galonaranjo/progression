import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "./Navbar";
import Home from "./pages/Home";
import Videos from "./pages/Videos";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("accessToken"));

  const handleLoginSuccess = (credentialResponse) => {
    console.log("Login successful:", credentialResponse);
    const token = credentialResponse.credential;
    setIsLoggedIn(true);
    localStorage.setItem("accessToken", token);
  };

  const handleLoginFailure = (error) => {
    console.error("Login failed:", error);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    // Optionally, you can add logic here to validate the token
    // and remove it if it's expired or invalid
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_YOUTUBE_CLIENT_ID}>
      <Router>
        <div className="bg-white">
          {isLoggedIn && <Navbar onLogout={handleLogout} />}
          <main className="mt-4">
            {!isLoggedIn ? (
              <Login onSuccess={handleLoginSuccess} onFailure={handleLoginFailure} />
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
    </GoogleOAuthProvider>
  );
}

export default App;
