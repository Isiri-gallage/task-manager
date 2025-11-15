import './SearchBar.css';

function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="search-bar">
      <span className="search-icon"><i className="fas fa-search"></i></span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tasks..."
        className="search-input"
      />
      {searchQuery && (
        <button 
          onClick={() => onSearchChange('')}
          className="clear-search"
          title="Clear search"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}

export default SearchBar;