import './ExportButtons.css';

function ExportButtons({ tasks }) {
  const exportToCSV = () => {
    // Create CSV header
    const headers = ['Task', 'Status', 'Priority', 'Due Date', 'Category', 'Created'];
    
    // Create CSV rows
    const rows = tasks.map(task => [
      task.text,
      task.completed ? 'Completed' : 'Active',
      task.priority || 'medium',
      task.dueDate || 'No date',
      task.category || 'No category',
      new Date(task.createdAt).toLocaleDateString()
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="export-buttons">
      <button onClick={exportToCSV} className="export-btn csv">
        📊 Export CSV
      </button>
      <button onClick={exportToJSON} className="export-btn json">
        📄 Export JSON
      </button>
    </div>
  );
}

export default ExportButtons;