import { useState, useEffect } from 'react';
import './VoiceInput.css';

function VoiceInput({ onVoiceInput }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      onVoiceInput(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setTranscript('Error: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setTranscript(''), 2000);
    };

    recognition.start();
  };

  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <div className="voice-input-container">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        title="Add task by voice"
      >
        {isListening ? (
          <>
            <i className="fas fa-microphone-slash"></i>
            <span className="pulse-ring"></span>
          </>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
      </button>
      {transcript && (
        <div className="voice-transcript">
          {transcript}
        </div>
      )}
    </div>
  );
}

export default VoiceInput;