// App.js

import React, { useState, useEffect } from 'react';
import TopCarousel from './components/TopCarousel';
import BottomCarousel from './components/BottomCarousel';
import LissajousFigure from './components/LissajousFigure';
import './App.css';
import axios from 'axios';

function App() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [preFilled, setPreFilled] = useState(true);
  const [botResponse, setBotResponse] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    if (selectedChallenge && selectedSolution) {
      // Make API call to backend
      axios.post('/api/evaluate', {
        challenge: selectedChallenge,
        solution: selectedSolution,
        pre_filled: preFilled,
        attempt_number: attemptNumber,
      })
      .then(response => {
        setBotResponse(response.data.bot_response);
        // Additional handling can be added here
        // Decode and set audio source
        const audioBase64 = response.data.audio_base64;
        const audioURL = `data:audio/mpeg;base64,${audioBase64}`;
        setAudioSrc(audioURL);

        // Play audio
        const audio = new Audio(audioURL);
        audio.play();
      })
      .catch(error => console.error('Error:', error));
    }
  }, [selectedChallenge, selectedSolution]);

  const reset = () => {
    setSelectedChallenge(null);
    setSelectedSolution(null);
    setAttemptNumber(0);
    setPreFilled(true);
    setBotResponse('');
  };

  return (
    <div className="App">
      <TopCarousel
        selectedChallenge={selectedChallenge}
        setSelectedChallenge={setSelectedChallenge}
      />
      <LissajousFigure
        selectedChallenge={selectedChallenge}
        selectedSolution={selectedSolution}
      />
      <BottomCarousel
        selectedSolution={selectedSolution}
        setSelectedSolution={setSelectedSolution}
        preFilled={preFilled}
        setPreFilled={setPreFilled}
        showManualInput={showManualInput}
        setShowManualInput={setShowManualInput}
        attemptNumber={attemptNumber}
        setAttemptNumber={setAttemptNumber}
      />
      {botResponse && <div className="bot-response">{botResponse}</div>}
      /* Audio control, optional */
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
}

export default App;
