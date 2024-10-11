import React, { useState, useEffect, useCallback, useRef} from "react";
import TopCarousel from "./components/TopCarousel";
import BottomCarousel from "./components/BottomCarousel";
import Chatbox from "./components/Chatbox";
import BoredEmoticons from "./components/BoredEmoticons";
import SolutionSelection from './components/SolutionSelection';

import "./App.css";
import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:1232";
const INACTIVITY_TIMEOUT = 60000; // 30 seconds in milliseconds

function App() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [preFilled, setPreFilled] = useState(true);
  const [botResponse, setBotResponse] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomCarousel, setShowBottomCarousel] = useState(false);
  const [canSubmitNewSolution, setCanSubmitNewSolution] = useState(true);
  const [isBored, setIsBored] = useState(false);
  const [lastSelectedSolution, setLastSelectedSolution] = useState(null);
 

  const audioBoring = new Audio("/assets/boring.wav");
  const audioOG = new Audio("/assets/og.wav");

  // Reference to hold the inactivity timer ID
  const inactivityTimerRef = useRef(null);

  // Function to reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear any existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Set a new timer
    inactivityTimerRef.current = setTimeout(() => {
      window.location.reload();
    }, INACTIVITY_TIMEOUT);
  }, []);

  // Effect hook to monitor changes and reset the timer
  useEffect(() => {
    resetInactivityTimer();

    // Cleanup function to clear the timer when the component unmounts
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [selectedChallenge, selectedSolution, resetInactivityTimer]);

    
  const makeApiCall = useCallback(() => {
    console.log("Challenge:", selectedChallenge);
    console.log("Solution:", selectedSolution);

    if (selectedChallenge && selectedSolution===null){
      console.log("No solution selected yet");
      // 
      // 
      setBotResponse(`Algy\n 
        Hi I am Algy. What a great choice. What solutions \
        do you have in mind to solve some of the issues related to\
        ${selectedChallenge}?`);
      setShowBottomCarousel(true);
    }
    else if (selectedChallenge  && selectedSolution===""){
      setBotResponse("You will actually need to fill in text here..like, with the keyboard..");
      
    }else if (selectedChallenge  && selectedSolution!==""){
      // if selectedSolution===lastSelectedSolution, set isBored to true

      console.log("Making API call");
      setIsLoading(true);
      setBotResponse("");
      setCanSubmitNewSolution(false);

      const apiPayload = {
        challenge: selectedChallenge,
        solution: selectedSolution || "",
        pre_filled: preFilled,
        attempt_number: attemptNumber,
      };

      axios
        .post(`${backendUrl}/api/evaluate`, apiPayload)
        .then((response) => {
          setBotResponse(response.data.bot_response);
          const audioBase64 = response.data.audio_base64;
          const audioURL = `data:audio/mpeg;base64,${audioBase64}`;
          setAudioSrc(audioURL);

          const audio = new Audio(audioURL);
          audio.play();

          // TODO: if response.data.original==false then give bored emoji screensaver for 10 seconds,  
          // and play bored music for 10 seconds, then reset screen and attemptNumber to 0
          if (!response.data.original) {
            audioBoring.play();
          }else{
          // TODO: if response.data.original==true then give party emoji screensaver for 10 seconds, 
          // and play glorious music, then restart the session            
            audioOG.play();
        }

        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
          setIsLoading(false);
          setShowBottomCarousel(true);
          setCanSubmitNewSolution(true);
        });
    }
  }, [selectedChallenge, selectedSolution, preFilled, attemptNumber]);

  useEffect(() => {
    makeApiCall();
  }, [makeApiCall]);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setSelectedSolution(null);
    setAttemptNumber(0);
    setBotResponse("");
    setShowBottomCarousel(false);
    setCanSubmitNewSolution(true);
    setIsBored(false);
    setLastSelectedSolution(null);
  };

  const handleSolutionSelect = (solution) => {
    if (canSubmitNewSolution) {
      if (preFilled && solution === lastSelectedSolution) {
        setIsBored(true);
        setTimeout(() => setIsBored(false), 3000); // Reset bored state after 3 seconds
      } else {
        setSelectedSolution(solution);
        setAttemptNumber((prev) => prev + 1);
        setLastSelectedSolution(solution);
        setIsBored(false);
      }
    }
  };

  return (
    <div className={`App ${(showManualInput || attemptNumber>=2) ? 'manual-input-active' : ''}`}>
      <div className="Title">Let's save the world with tech</div>
      {selectedChallenge==null && (
      <TopCarousel
        selectedChallenge={selectedChallenge}
        setSelectedChallenge={handleChallengeSelect}
      />
      )}
      <div className="topSeparator"> </div>
      <Chatbox
        selectedChallenge={selectedChallenge}
        selectedSolution={selectedSolution}
        botResponse={botResponse}
        isLoading={isLoading}
      />
      <div className="bottomSeparator">   </div>
      {showBottomCarousel && (
        <BottomCarousel
          selectedChallenge={selectedChallenge}
          selectedSolution={selectedSolution}
          setSelectedSolution={handleSolutionSelect}
          preFilled={preFilled}
          setPreFilled={setPreFilled}
          showManualInput={showManualInput}
          setShowManualInput={setShowManualInput}
          canSubmitNewSolution={canSubmitNewSolution}
          attemptNumber={attemptNumber}
        />
      )}
      {isBored && <BoredEmoticons />}
      <div className="FooterBar">Hint, put on the headphones 🎧</div>
    </div>
  );
}

export default App;