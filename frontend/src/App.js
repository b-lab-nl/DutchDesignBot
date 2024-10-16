import React, { useState, useEffect, useCallback, useRef } from "react";
import TopCarousel from "./components/TopCarousel";
import BottomCarousel from "./components/BottomCarousel";
import Chatbox from "./components/Chatbox";
import BoredEmoticons from "./components/BoredEmoticons";
import SolutionSelection from "./components/SolutionSelection";
import ReactConfetti from "react-confetti";

import "./App.css";
import axios from "axios";

const standard_answer_dict_lead = {
  Inclusivity: {
    "Blockchain voting":
      "Ah, let’s see. We could use blockchain to enhance participation and reduce election fraud…",
    "AI language translation":
      "Ok. We could use AI language translation for real-time multilingual communication?",
    "Digital twins":
      "We can create digital twins to better simulate and design inclusive environments.",
  },
  Safety: {
    "Biometric authentication":
      "Ah, let’s see. We could use  fingerprint or facial recognition for secure access?",
    "Smart drones":
      "Ok. We could use automated surveillance to monitor sensitive areas…",
    "Behavioral analytics":
      "Mmm, what if we use AI to predict and prevent dangerous behavior?",
  },
  Healthcare: {
    "AI drug discovery":
      "Ah, let’s see. We can use machine learning to find potential treatments faster.",
    Wearables:
      "Ok. What if we use devices like smartwatches to monitor health conditions continuously?",
    "Telemedicine robots":
      "Sure, we could use remotely controlled robots for home visits.",
  },
  Housing: {
    "AI for urban planning":
      "Ah, let’s see. We can use AI to design better living spaces.",
    "Floating modular homes":
      "Ok. What if we use adaptable housing solutions for rising sea levels.",
    "IoT-enabled smart homes":
      "Sure, we could use optimizing energy and resource usage in houses.",
  },
  Energy: {
    "AI-driven smart grid":
      "Ah, let’s see. We can use optimized electricity distribution and reduce waste.",
    "Blockchain energy trading":
      "Ok. What if we set up decentralized peer-to-peer trading system of surplus energy.",
    "Consumption monitoring":
      "Sure, we could use IoT for households to optimize energy use.",
  },
  Water: {
    "Renewable water purification":
      "Ah, let’s see. We can use water purification technologies to make ocean water drinkable.",
    "AI to predict water scarcity":
      "Ok. What if we use data to forecast and manage water shortages.",
    "Fog harvesting":
      "Sure, we could start collecting water from the air in arid areas.",
  },
  Food: {
    "AI precision agriculture":
      "Ah, let’s see. We can use data to maximize crop yields and minimize waste.",
    "Vertical farming":
      "Ok. Sure, we can use empty office building as vertical farms",
    "Lab grown protein":
      "Sure, we could use creating new food proteins to meet demand.",
  },
};

const standard_answer_dict_trail = {
  Inclusivity: {
    "Blockchain voting":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better.",
    "AI language translation":
      "Pretty standard. Been here before. Try to be more creative!",
    "Digital twins":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Safety: {
    "Biometric authentication":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better.",
    "Smart drones":
      "Pretty standard. Been here before. Try to be more creative!",
    "Behavioral analytics":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Healthcare: {
    "AI drug discovery":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better.",
    Wearables: "Pretty standard. Been here before. Try to be more creative!",
    "Telemedicine robots":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Housing: {
    "AI for urban planning":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better",
    "Floating modular homes":
      "Pretty standard. Been here before. Try to be more creative!",
    "IoT-enabled smart homes":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Energy: {
    "AI-driven smart grid":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better.",
    "Blockchain energy trading":
      "Pretty standard. Been here before. Try to be more creative!",
    "Consumption monitoring":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Water: {
    "Renewable water purification":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better. ",
    "AI to predict water scarcity":
      "Pretty standard. Been here before. Try to be more creative!",
    "Fog harvesting":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
  Food: {
    "AI precision agriculture":
      "I feel like I’ve heard that idea before. A lot of people have come up with the same thing. I think you can do better.",
    "Vertical farming":
      "Pretty standard. Been here before. Try to be more creative!",
    "Lab grown protein":
      "I’ve heard that again and again. What about thinking of something unexpected?",
  },
};

const standard_answer_dict_og = {
  Inclusivity: {
    "Blockchain voting": 21,
    "AI language translation": 5,
    "Digital twins": 19,
  },
  Safety: {
    "Biometric authentication": 8,
    "Smart drones": 2,
    "Behavioral analytics": 14,
  },
  Healthcare: {
    "AI drug discovery": 46,
    Wearables: 12,
    "Telemedicine robots": 3,
  },
  Housing: {
    "AI for urban planning": 11,
    "Floating modular homes": 14,
    "IoT-enabled smart homes": 17,
  },
  Energy: {
    "AI-driven smart grid": 48,
    "Blockchain energy trading": 49.5,
    "Consumption monitoring": 12,
  },
  Water: {
    "Renewable water purification": 16,
    "AI to predict water scarcity": 35,
    "Fog harvesting": 40,
  },
  Food: {
    "AI precision agriculture": 12,
    "Vertical farming": 25,
    "Lab grown protein": 47,
  },
};

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:1232";
const INACTIVITY_TIMEOUT = 60_000; // 30 seconds in milliseconds

function App() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [preFilled, setPreFilled] = useState(true);
  const [botResponse, setBotResponse] = useState("");
  const [oGscore, setOGscore] = useState(null);
  const [victory, setVictory] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBottomCarousel, setShowBottomCarousel] = useState(false);
  const [canSubmitNewSolution, setCanSubmitNewSolution] = useState(true);
  const [isBored, setIsBored] = useState(false);
  const [lastSelectedSolution, setLastSelectedSolution] = useState(null);
  const [isHoveredOnOther, setIsHoveredOnOther] = useState(false);

  const audioBoring = new Audio("/assets/boring.wav");
  const audioOG = new Audio("/assets/og.wav");
  const audioVictory = new Audio("/assets/victory.wav");

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

  useEffect(() => {
    if (victory) {
      // Optional: Display a message or animation here
      // Then reset the game after a delay
      const resetTimeout = setTimeout(() => {
        window.location.reload();
      }, 10_000); // Adjust the delay as needed

      // Cleanup timeout if the component unmounts
      return () => clearTimeout(resetTimeout);
    }
  }, [victory]);

  const makeApiCall = useCallback(() => {
    console.log("Challenge:", selectedChallenge);
    console.log("Solution:", selectedSolution);

    if (selectedChallenge && selectedSolution === null) {
      console.log("No solution selected yet");
      //
      // add a sleep timer here to simulate the user thinking
      //
      setCanSubmitNewSolution(false);
      setBotResponse(`. . . . . . . . . .`);
      setTimeout(() => {
        var botResponseText = `Welcome, I am Aly. \n${selectedChallenge}, what a great choice. What solutions \
          do you have in mind to solve some of the issues related to\
              ${selectedChallenge}?`;

        // send to API for sound generation
        const textSnippet = {
          textsnippet: botResponseText,
          positive: true,
        };
        axios
          .post(`${backendUrl}/api/sound`, textSnippet)
          .then((response) => {
            const audioBase64 = response.data.audio_base64;
            const audioURL = `data:audio/mpeg;base64,${audioBase64}`;
            setAudioSrc(audioURL);

            const audio = new Audio(audioURL);
            audio.play();
            setBotResponse(botResponseText);
          })
          .catch((error) => console.error("Error:", error))
          .finally(() => {
            setIsLoading(false);
            setShowBottomCarousel(true);
          });
      }, 2700);

      setTimeout(() => {
        setCanSubmitNewSolution(true);
      }, 10_000);

      setShowBottomCarousel(true);
    } else if (selectedChallenge && selectedSolution === "") {
      setBotResponse("Be creative and get a super originality score");
    } else if (
      selectedChallenge &&
      selectedSolution !== "" &&
      preFilled === false
    ) {
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
          setOGscore(response.data.og_score);
          setBotResponse(response.data.bot_response);
          const audioBase64 = response.data.audio_base64;
          const audioURL = `data:audio/mpeg;base64,${audioBase64}`;
          setAudioSrc(audioURL);

          const audio = new Audio(audioURL);
          audio.play();

          if (!response.data.original) {
            setTimeout(() => {
              audioBoring.play();
              setIsBored(true);
            }, 9000);
          } else {
            setTimeout(() => {
              audioOG.play();
              setVictory(true);
              audioVictory.play();
            }, 15000);
          }
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
          setIsLoading(false);
          setShowBottomCarousel(true);
        });
    } else if (
      selectedChallenge &&
      selectedSolution !== "" &&
      preFilled === true
    ) {
      const leadResponse =
        standard_answer_dict_lead[selectedChallenge][selectedSolution];
      const trailResponse =
        standard_answer_dict_trail[selectedChallenge][selectedSolution];
      const botResponseText = `${leadResponse} \n ${trailResponse}`;

      setIsLoading(true);
      setBotResponse("");
      setCanSubmitNewSolution(false);

      const apiPayload = {
        challenge: selectedChallenge,
        solution: selectedSolution || "",
        pre_filled: preFilled,
        attempt_number: attemptNumber,
      };
      axios.post(`${backendUrl}/api/evaluate`, apiPayload);

      setTimeout(() => {
        // Send to API for sound generation
        const textSnippet = {
          textsnippet: botResponseText,
          positive: true,
        };
        axios
          .post(`${backendUrl}/api/sound`, textSnippet)
          .then((response) => {
            const audioBase64 = response.data.audio_base64;
            const audioURL = `data:audio/mpeg;base64,${audioBase64}`;
            setAudioSrc(audioURL);

            const audio = new Audio(audioURL);
            audio.play();

            // pre-selected so boring
            setTimeout(() => {
              audioBoring.play();
              setIsBored(true);
            }, 9000);
            // set og score
            setOGscore(
              standard_answer_dict_og[selectedChallenge][selectedSolution],
            );
            setBotResponse(botResponseText);
          })
          .catch((error) => console.error("Error:", error))
          .finally(() => {
            setIsLoading(false);
            setShowBottomCarousel(true);
          });
      }, 2700);
    }
  }, [selectedChallenge, selectedSolution, preFilled, attemptNumber]);

  setTimeout(() => {
    setCanSubmitNewSolution(true);
  }, 15000);

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
    <div
      className={`App ${showManualInput || isHoveredOnOther ? "manual-input-active" : ""} ${victory ? "victory" : ""}`}
    >
      <div className="Title">Let's save the world with tech</div>
      {selectedChallenge == null && (
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
        oGscore={oGscore}
        attemptNumber={attemptNumber}
        isLoading={isLoading}
      />
      <div className="bottomSeparator"> </div>
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
          isHoveredOnOther={isHoveredOnOther}
          setIsHoveredOnOther={setIsHoveredOnOther}
        />
      )}

      {/* Victory Message */}
      {/* Victory Message */}
      {victory && (
        <>
          <div className="victory-message">You are a genius!</div>
          <ReactConfetti />
        </>
      )}
      {isBored && <BoredEmoticons />}
      <div className="FooterBar">Hint__put on the headphones 🎧</div>
    </div>
  );
}

export default App;
