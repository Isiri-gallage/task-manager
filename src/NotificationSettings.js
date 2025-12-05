import { useState, useEffect } from 'react';
import './NotificationSettings.css';

function NotificationSettings() {
  const [permission, setPermission] = useState(Notification.permission);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Show test notification
        new Notification('Notifications Enabled!', {
          body: 'You\'ll now receive reminders for upcoming tasks.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const getStatusIcon = () => {
    switch (permission) {
      case 'granted':
        return <i className="fas fa-bell"></i>;
      case 'denied':
        return <i className="fas fa-bell-slash"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Blocked';
      default:
        return 'Disabled';
    }
  };

  if (!('Notification' in window)) {
    return null; // Browser doesn't support notifications
  }

  return (
    <div className="notification-settings">
      <button
        className={`notification-toggle ${permission}`}
        onClick={() => setShowSettings(!showSettings)}
        title="Notification Settings"
      >
        {getStatusIcon()}
      </button>

      {showSettings && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>
          <p className="notification-status">
            Status: <strong>{getStatusText()}</strong>
          </p>
          
          {permission === 'default' && (
            <button onClick={requestPermission} className="enable-button">
              Enable Notifications
            </button>
          )}
          
          {permission === 'granted' && (
            <p className="notification-info">
              <i className="fas fa-check-circle"></i> You'll receive reminders for tasks due today and 10 minutes before scheduled tasks.
            </p>
          )}
          
          {permission === 'denied' && (
            <p className="notification-warning">
              <i className="fas fa-exclamation-triangle"></i> Notifications are blocked. Enable them in your browser settings.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
