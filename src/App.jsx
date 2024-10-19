import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./pages/Home";
import Videos from "./pages/Videos";

function App() {
  return (
    <Router>
      <div className="bg-white">
        <Navbar />
        <main className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<Videos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
