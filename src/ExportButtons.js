import './ExportButtons.css';
import { jsPDF } from 'jspdf';

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
      
      // Title
      doc.setFontSize(24);
      doc.setTextColor(52, 152, 219);
      doc.text('Task Manager Report', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
      
      // Line separator
      doc.setDrawColor(189, 195, 199);
      doc.line(20, 35, 190, 35);
      
      let yPosition = 45;
      
      if (tasks.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(149, 165, 166);
        doc.text('No tasks to display', 105, yPosition, { align: 'center' });
      } else {
        // Summary stats
        doc.setFontSize(12);
        doc.setTextColor(44, 62, 80);
        const completed = tasks.filter(t => t.completed).length;
        const active = tasks.length - completed;
        
        doc.text(`Total Tasks: ${tasks.length}`, 20, yPosition);
        doc.text(`Active: ${active}`, 80, yPosition);
        doc.text(`Completed: ${completed}`, 130, yPosition);
        
        yPosition += 15;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
        
        // Tasks list
        tasks.forEach((task, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Task number
          doc.setFontSize(10);
          doc.setTextColor(127, 140, 141);
          doc.text(`${index + 1}.`, 20, yPosition);
          
          // Task text
          doc.setFontSize(11);
          doc.setTextColor(44, 62, 80);
          const taskText = task.text.length > 60 ? task.text.substring(0, 60) + '...' : task.text;
          doc.text(taskText, 28, yPosition);
          
          yPosition += 6;
          
          // Task details
          doc.setFontSize(9);
          doc.setTextColor(127, 140, 141);
          
          let details = [];
          details.push(`Status: ${task.completed ? 'Completed' : 'Active'}`);
          details.push(`Priority: ${(task.priority || 'medium').toUpperCase()}`);
          if (task.dueDate) {
            details.push(`Due: ${new Date(task.dueDate).toLocaleDateString()}`);
          }
          if (task.category) {
            details.push(`Category: ${task.category}`);
          }
          
          doc.text(details.join(' | '), 28, yPosition);
          
          yPosition += 8;
          
          // Separator line
          doc.setDrawColor(236, 240, 241);
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 5;
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(149, 165, 166);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }
      
      // Save
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Task Manager - Task List', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare table data
    const tableData = tasks.map(task => [
      task.text,
      task.completed ? 'Completed' : 'Active',
      task.priority || 'medium',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date',
      task.category || 'No category'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Task', 'Status', 'Priority', 'Due Date', 'Category']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 9 }
    });
    
    // Save PDF
    doc.save(`tasks_${new Date().toISOString().split('T')[0]}.pdf`);
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