import { useState } from 'react';
import './TaskInput.css';

function TaskInput({ onAddTask }) {
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [category, setCategory] = useState('');
  const [recurring, setRecurring] = useState('none');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText, priority, dueDate, dueTime, category, recurring);
      setTaskText('');
      setDueDate('');
      setDueTime('');
      setCategory('');
      setPriority('medium');
      setRecurring('none');
      setShowAdvanced(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-input">
      <div className="input-row">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="What needs to be done?"
          className="task-input-field"
        />
        <button 
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="More options"
        >
          {showAdvanced ? '−' : '+'}
        </button>
        <button type="submit" className="add-button">Add</button>
      </div>

      {showAdvanced && (
        <div className="advanced-options">
          <div className="option-group">
            <label>Priority:</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="priority-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="option-group">
            <label>Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="option-group">
            <label>Due Time:</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="time-input"
            />
          </div>

          <div className="option-group">
            <label>Category:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Work, Personal, etc."
              className="category-input"
            />
          </div>

          <div className="option-group">
            <label>Recurring:</label>
            <select 
              value={recurring} 
              onChange={(e) => setRecurring(e.target.value)}
              className="recurring-select"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      )}
    </form>
  );
}

export default TaskInput;