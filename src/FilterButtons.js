import './FilterButtons.css';

function FilterButtons({ currentFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All', icon: 'fa-list' },
    { id: 'active', label: 'Active', icon: 'fa-hourglass-half' },
    { id: 'completed', label: 'Completed', icon: 'fa-check-circle' },
    { id: 'high', label: 'High', icon: 'fa-circle', color: '#e74c3c' },
    { id: 'medium', label: 'Medium', icon: 'fa-circle', color: '#f39c12' },
    { id: 'low', label: 'Low', icon: 'fa-circle', color: '#3498db' },
    { id: 'overdue', label: 'Overdue', icon: 'fa-exclamation-triangle' }
  ];

  return (
    <div className="filter-buttons">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`filter-button ${currentFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          <span className="filter-icon" style={filter.color ? { color: filter.color } : {}}>
            <i className={`fas ${filter.icon}`}></i>
          </span>
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons;