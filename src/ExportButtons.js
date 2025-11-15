import './ExportButtons.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function ExportButtons({ tasks }) {
  const exportToCSV = () => {
    const headers = ['Task', 'Status', 'Priority', 'Due Date', 'Category', 'Created'];
    
    const rows = tasks.map(task => [
      task.text,
      task.completed ? 'Completed' : 'Active',
      task.priority || 'medium',
      task.dueDate || 'No date',
      task.category || 'No category',
      new Date(task.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
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

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Task Manager - Task List', 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      if (tasks.length === 0) {
        doc.setFontSize(12);
        doc.text('No tasks to export', 14, 45);
      } else {
        // Prepare table data
        const tableData = tasks.map(task => [
          task.text,
          task.completed ? 'Completed' : 'Active',
          task.priority || 'medium',
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date',
          task.category || 'No category'
        ]);
        
        // Add table - note: autoTable is now a method on doc
        doc.autoTable({
          head: [['Task', 'Status', 'Priority', 'Due Date', 'Category']],
          body: tableData,
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 9 }
        });
      }
      
      // Save PDF
      doc.save(`tasks_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF exported successfully!');
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF: ' + error.message);
    }
  };

  return (
    <div className="export-buttons">
      <button onClick={exportToCSV} className="export-btn csv">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6M10 12h4M10 16h4M10 8h2"/>
        </svg>
        Export CSV
      </button>
      <button onClick={exportToJSON} className="export-btn json">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/>
          <path d="M13 2v7h7"/>
        </svg>
        Export JSON
      </button>
      <button onClick={exportToPDF} className="export-btn pdf">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>
        </svg>
        Export PDF
      </button>
    </div>
  );
}

export default ExportButtons;