import './Statistics.css';

function Statistics({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium' && !t.completed).length;
  const lowPriority = tasks.filter(t => t.priority === 'low' && !t.completed).length;

  // Overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate < today;
  }).length;

  // Category breakdown
  const categories = {};
  tasks.forEach(task => {
    if (task.category) {
      categories[task.category] = (categories[task.category] || 0) + 1;
    }
  });

  // Tasks completed this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeek = tasks.filter(t => {
    if (!t.completed) return false;
    const createdDate = new Date(t.createdAt);
    return createdDate >= oneWeekAgo;
  }).length;

  return (
    <div className="statistics">
      <h2><i className="fas fa-chart-bar"></i> Your Productivity Stats</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{activeTasks}</div>
          <div className="stat-label">Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-label">Overall Progress</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="stats-section">
        <h3>Priority Breakdown (Active Tasks)</h3>
        <div className="priority-stats">
          <div className="priority-stat high">
            <span className="priority-label"><i className="fas fa-circle" style={{color: '#e74c3c'}}></i> High Priority</span>
            <span className="priority-count">{highPriority}</span>
          </div>
          <div className="priority-stat medium">
            <span className="priority-label"><i className="fas fa-circle" style={{color: '#f39c12'}}></i> Medium Priority</span>
            <span className="priority-count">{mediumPriority}</span>
          </div>
          <div className="priority-stat low">
            <span className="priority-label"><i className="fas fa-circle" style={{color: '#3498db'}}></i> Low Priority</span>
            <span className="priority-count">{lowPriority}</span>
          </div>
        </div>
      </div>

      {overdueTasks > 0 && (
        <div className="alert-box">
          <i className="fas fa-exclamation-triangle"></i> You have <strong>{overdueTasks}</strong> overdue task{overdueTasks > 1 ? 's' : ''}
        </div>
      )}

      {Object.keys(categories).length > 0 && (
        <div className="stats-section">
          <h3>Categories</h3>
          <div className="category-list">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category} className="category-stat">
                <span className="category-name"><i className="fas fa-tag"></i> {category}</span>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-footer">
        <p><i className="fas fa-star"></i> Completed {completedThisWeek} tasks this week!</p>
      </div>
    </div>
  );
}

export default Statistics;