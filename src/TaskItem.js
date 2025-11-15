import { useState } from 'react';
import './TaskItem.css';

function TaskItem({ task, onToggle, onDelete, onEdit, onUpdatePriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleEdit = () => {
    if (editText.trim() && editText !== task.text) {
      onEdit(task.id, editText);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="task-checkbox"
      />

      <div className="task-content">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={handleKeyPress}
            className="task-edit-input"
            autoFocus
          />
        ) : (
          <div className="task-text-container">
            <span 
              className="task-text"
              onDoubleClick={() => !task.completed && setIsEditing(true)}
              title="Double-click to edit"
            >
              {task.text}
            </span>
            <div className="task-meta">
              {task.category && (
                <span className="task-category">
                  <i className="fas fa-tag"></i> {task.category}
                </span>
              )}
              {task.dueDate && (
                <span className={`task-due-date ${isOverdue() ? 'overdue' : ''}`}>
                  <i className="fas fa-calendar"></i> {formatDate(task.dueDate)}
                </span>
              )}
              {task.recurring && task.recurring !== 'none' && (
                <span className="task-recurring">
                  <i className="fas fa-rotate"></i> {task.recurring.charAt(0).toUpperCase() + task.recurring.slice(1)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="task-actions">
        <select
          value={task.priority}
          onChange={(e) => onUpdatePriority(task.id, e.target.value)}
          className="priority-badge"
          style={{ borderColor: getPriorityColor(task.priority) }}
          disabled={task.completed}
        >
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        
        <button 
          onClick={() => onDelete(task.id)}
          className="delete-button"
          title="Delete task"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
}

export default TaskItem;