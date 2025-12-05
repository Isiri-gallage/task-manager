import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import Auth from './Auth';
import './App.css';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import FilterButtons from './FilterButtons';
import Statistics from './Statistics';
import SearchBar from './SearchBar';
import ExportButtons from './ExportButtons';
import NotificationManager from './NotificationManager';
import NotificationSettings from './NotificationSettings';
import KanbanBoard from './KanbanBoard';  
import PomodoroTimer from './PomodoroTimer';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState('list');  // STATE: 'list' or 'kanban'

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Load tasks from Firestore when user logs in
  useEffect(() => {
    if (user) {
      loadTasksFromFirestore();
    } else {
      setTasks([]);
    }
  }, [user]);

  const loadTasksFromFirestore = async () => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // If orderBy fails (no index), try without it
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setTasks(tasksData);
      } catch (err) {
        console.error('Error loading tasks (fallback):', err);
      }
    }
  };

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

  // Add task to Firestore
  const addTask = async (text, priority, dueDate, dueTime, category, recurring) => {
    const newTask = {
      text,
      completed: false,
      priority,
      dueDate,
      dueTime: dueTime || '',
      category,
      recurring: recurring || 'none',
      status: null,  // ✅ NEW: for Kanban board
      createdAt: new Date().toISOString(),
      userId: user.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks([{ id: docRef.id, ...newTask }, ...tasks]);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  // Toggle task completion with recurring support
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    
    try {
      // If task is recurring and being completed, create a new instance
      if (!task.completed && task.recurring !== 'none') {
        const newDueDate = calculateNextDueDate(task.dueDate, task.recurring);
        const newTask = {
          text: task.text,
          completed: false,
          priority: task.priority,
          dueDate: newDueDate,
          dueTime: task.dueTime || '',
          category: task.category,
          recurring: task.recurring,
          status: null,
          createdAt: new Date().toISOString(),
          userId: user.uid
        };
        
        // Add new recurring task
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        
        // Mark current task as completed
        await updateDoc(doc(db, 'tasks', id), { completed: true, status: 'done' });
        
        // Update local state
        setTasks([{ id: docRef.id, ...newTask }, ...tasks.map(t => 
          t.id === id ? { ...t, completed: true, status: 'done' } : t
        )]);
      } else {
        // Normal toggle for non-recurring tasks
        await updateDoc(doc(db, 'tasks', id), { 
          completed: !task.completed,
          status: !task.completed ? 'done' : task.status
        });
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? 'done' : t.status } : t
        ));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  // Delete a task from Firestore (Optimistic Update)
  const deleteTask = async (id) => {
    const previousTasks = [...tasks];
    
    try {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasks(previousTasks);
      alert('Failed to delete task. Please try again.');
      throw error;
    }
  };

  // Edit a task in Firestore
  const editTask = async (id, newText) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { text: newText });
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, text: newText } : task
      ));
    } catch (error) {
      console.error('Error editing task:', error);
      alert('Failed to edit task. Please try again.');
    }
  };

  // Update task priority in Firestore
  const updatePriority = async (id, priority) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { priority });
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, priority } : task
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  // ✅ NEW FUNCTION: Update task status (for Kanban)
  const updateTaskStatus = async (id, status) => {
    try {
      const updates = {
        status: status,
        completed: status === 'done'
      };
      
      await updateDoc(doc(db, 'tasks', id), updates);
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Reorder tasks (local only - drag and drop)
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredTasks = getFilteredTasks();
  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <div className="header">
        <h1><i className="fas fa-tasks"></i> Task Manager</h1>
        <div className="header-buttons">
          <span className="user-email" title={user.email}>
            <i className="fas fa-user-circle"></i> {user.email.split('@')[0]}
          </span>
          <NotificationSettings /> 
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
          {/* ✅ NEW: View Toggle Button */}
          <button 
            className="view-toggle"
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            title={viewMode === 'list' ? 'Kanban View' : 'List View'}
          >
            <i className={`fas fa-${viewMode === 'list' ? 'columns' : 'list'}`}></i>
          </button>
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
          
          {/* ✅ NEW: Conditional rendering based on viewMode */}
          {viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
              onUpdatePriority={updatePriority}
              onUpdateStatus={updateTaskStatus}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
              onUpdatePriority={updatePriority}
              onReorder={reorderTasks}
            />
          )}
          
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
      <NotificationManager tasks={tasks} /> 
      <PomodoroTimer />
    </div>
  );
}

export default App;