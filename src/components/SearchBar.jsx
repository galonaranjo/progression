import PropTypes from "prop-types";

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <input
      type="text"
      placeholder="Search video history..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="flex-grow px-4 py-2 text-black rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;
