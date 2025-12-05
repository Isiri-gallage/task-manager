import { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';

function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const WORK_TIME = 25;
  const SHORT_BREAK = 5;
  const LONG_BREAK = 15;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    playSound();
    sendNotification();

    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      // Every 4 work sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setMinutes(LONG_BREAK);
      } else {
        setMode('shortBreak');
        setMinutes(SHORT_BREAK);
      }
    } else {
      setMode('work');
      setMinutes(WORK_TIME);
    }
    
    setSeconds(0);
  };

  const playSound = () => {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'work' 
        ? '🎉 Work session complete! Time for a break.'
        : '✨ Break time over! Ready to focus?';
      
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(WORK_TIME);
    setSeconds(0);
  };

  const skipTimer = () => {
    setIsActive(false);
    handleTimerComplete();
  };

  const changeMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    
    switch(newMode) {
      case 'work':
        setMinutes(WORK_TIME);
        break;
      case 'shortBreak':
        setMinutes(SHORT_BREAK);
        break;
      case 'longBreak':
        setMinutes(LONG_BREAK);
        break;
      default:
        setMinutes(WORK_TIME);
    }
    
    setSeconds(0);
  };

  const getModeLabel = () => {
    switch(mode) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  const getModeIcon = () => {
    switch(mode) {
      case 'work': return '💼';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌟';
      default: return '💼';
    }
  };

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = mode === 'work' ? WORK_TIME * 60 : 
                        mode === 'shortBreak' ? SHORT_BREAK * 60 : 
                        LONG_BREAK * 60;
    const currentSeconds = minutes * 60 + seconds;
    return ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  };

  return (
    <div className="pomodoro-container">
      <button
        className="pomodoro-toggle-btn"
        onClick={() => setShowTimer(!showTimer)}
        title="Pomodoro Timer"
      >
        <i className="fas fa-clock"></i>
      </button>

      {showTimer && (
        <div className="pomodoro-modal">
          <div className="pomodoro-window">
            <div className="pomodoro-header">
              <h3>
                <i className="fas fa-clock"></i> Pomodoro Timer
              </h3>
              <button
                className="pomodoro-close"
                onClick={() => setShowTimer(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="pomodoro-mode-selector">
              <button
                className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
                onClick={() => changeMode('work')}
              >
                💼 Work
              </button>
              <button
                className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
                onClick={() => changeMode('shortBreak')}
              >
                ☕ Short Break
              </button>
              <button
                className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
                onClick={() => changeMode('longBreak')}
              >
                🌟 Long Break
              </button>
            </div>

            <div className={`pomodoro-display ${mode}`}>
              <div className="pomodoro-mode-label">
                {getModeIcon()} {getModeLabel()}
              </div>
              
              <div className="pomodoro-time">
                {formatTime(minutes, seconds)}
              </div>

              <div className="pomodoro-progress">
                <div 
                  className="pomodoro-progress-bar"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>

              <div className="pomodoro-sessions">
                <i className="fas fa-check-circle"></i> Sessions completed: {sessions}
              </div>
            </div>

            <div className="pomodoro-controls">
              <button
                className={`control-btn ${isActive ? 'pause' : 'play'}`}
                onClick={toggleTimer}
              >
                <i className={`fas fa-${isActive ? 'pause' : 'play'}`}></i>
                {isActive ? 'Pause' : 'Start'}
              </button>
              
              <button
                className="control-btn reset"
                onClick={resetTimer}
              >
                <i className="fas fa-redo"></i>
                Reset
              </button>
              
              <button
                className="control-btn skip"
                onClick={skipTimer}
              >
                <i className="fas fa-forward"></i>
                Skip
              </button>
            </div>

            <div className="pomodoro-info">
              <p>💡 <strong>How it works:</strong></p>
              <ul>
                <li>Work for 25 minutes with full focus</li>
                <li>Take a 5-minute break</li>
                <li>After 4 sessions, take a 15-minute long break</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;