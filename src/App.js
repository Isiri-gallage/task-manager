import { useState, useEffect } from 'react';
import './App.css';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import FilterButtons from './FilterButtons';
import Statistics from './Statistics';
import SearchBar from './SearchBar';
import ExportButtons from './ExportButtons';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Helper function to calculate next due date
  const calculateNextDueDate = (currentDate, recurring) => {
    if (!currentDate) return '';
    
    const date = new Date(currentDate);
    
    switch(recurring) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return currentDate;
    }
    
    return date.toISOString().split('T')[0];
  };

  // Add a new task with recurring support
  const addTask = (text, priority, dueDate, category, recurring) => {
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      priority: priority,
      dueDate: dueDate,
      category: category,
      recurring: recurring || 'none',
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
  };

  // Toggle task completion with recurring support
  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    
    // If task is recurring and being completed, create a new instance
    if (!task.completed && task.recurring !== 'none') {
      const newDueDate = calculateNextDueDate(task.dueDate, task.recurring);
      const newTask = {
        ...task,
        id: Date.now(),
        dueDate: newDueDate,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      // Mark current task as completed and add new recurring task
      setTasks([newTask, ...tasks.map(t => 
        t.id === id ? { ...t, completed: true } : t
      )]);
    } else {
      // Normal toggle for non-recurring tasks
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Edit a task
  const editTask = (id, newText) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: newText } : task
    ));
  };

  // Update task priority
  const updatePriority = (id, priority) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, priority } : task
    ));
  };

  // Reorder tasks (for drag and drop)
  const reorderTasks = (oldIndex, newIndex) => {
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    setTasks(newTasks);
  };

  // Filter and search tasks
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filter === 'high') {
      filtered = filtered.filter(task => task.priority === 'high' && !task.completed);
    } else if (filter === 'medium') {
      filtered = filtered.filter(task => task.priority === 'medium' && !task.completed);
    } else if (filter === 'low') {
      filtered = filtered.filter(task => task.priority === 'low' && !task.completed);
    } else if (filter === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < today;
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <div className="header">
        <h1><i className="fas fa-tasks"></i> Task Manager</h1>
        <div className="header-buttons">
          <button 
            className="stats-toggle"
            onClick={() => setShowStats(!showStats)}
            title={showStats ? 'Show Tasks' : 'Show Statistics'}
          >
            {showStats ? <i className="fas fa-list-check"></i> : <i className="fas fa-chart-bar"></i>}
          </button>
          <button 
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>
        </div>
      </div>

      {showStats ? (
        <>
          <Statistics tasks={tasks} />
          <ExportButtons tasks={tasks} />
        </>
      ) : (
        <>
          <TaskInput onAddTask={addTask} />
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onUpdatePriority={updatePriority}
            onReorder={reorderTasks}
          />
          <div className="stats">
            <span className="stat-item">
              <strong>{activeCount}</strong> active
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              <strong>{completedCount}</strong> completed
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              <strong>{tasks.length}</strong> total
            </span>
          </div>
          <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
        </>
      )}
    </div>
  );
}

export default App;