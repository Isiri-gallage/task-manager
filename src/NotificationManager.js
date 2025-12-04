import { useEffect } from 'react';

function NotificationManager({ tasks }) {
  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for upcoming tasks every minute
    const interval = setInterval(() => {
      checkUpcomingTasks();
    }, 60000); // Check every minute

    // Initial check
    checkUpcomingTasks();

    return () => clearInterval(interval);
  }, [tasks]);

  const checkUpcomingTasks = () => {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const upcomingTasks = tasks.filter(task => {
      if (task.completed || !task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      
      // If task has time, use exact datetime
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':');
        dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Notify 10 minutes before
        const timeDiff = dueDate - now;
        const tenMinutes = 10 * 60 * 1000;
        
        return timeDiff > 0 && timeDiff <= tenMinutes;
      } else {
        // Notify if due today and not yet shown
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate.getTime() === today.getTime();
      }
    });

    upcomingTasks.forEach(task => {
      const notificationKey = `notified_${task.id}_${task.dueDate}`;
      
      // Don't notify if already notified today
      if (localStorage.getItem(notificationKey)) return;

      showNotification(task);
      localStorage.setItem(notificationKey, 'true');
    });
  };

  const showNotification = (task) => {
    const options = {
      body: `${task.text}\nPriority: ${task.priority}${task.category ? `\nCategory: ${task.category}` : ''}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: task.id.toString(),
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'complete', title: 'Mark Complete' }
      ]
    };

    const notification = new Notification('📋 Task Reminder', options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  return null; // This component doesn't render anything
}

export default NotificationManager;