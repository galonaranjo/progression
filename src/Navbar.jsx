import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-white hover:text-gray-300">
            Home
          </Link>
          <Link to="/videos" className="text-white hover:text-gray-300">
            Videos
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
