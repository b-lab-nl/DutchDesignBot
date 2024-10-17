// App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:1232";
const INACTIVITY_TIMEOUT = 600_000; //  in milliseconds

const EMOJIS = {
  human: ["🎉", "🎊", "🥳", "🪅", "🍾"],
  bot: ["😴", "🥱", "💤"],
};

const EmojiRain = ({ type }) => {
  return (
    <div className="emoji-rain">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="emoji"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 3}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {EMOJIS[type][Math.floor(Math.random() * EMOJIS[type].length)]}
        </div>
      ))}
    </div>
  );
};

const fetchScoresFromAPI = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return { human: data.human_score, bot: data.bot_score };
  } catch (error) {
    console.error("Error fetching scores:", error);
    throw error;
  }
};

const App = () => {
  const [scores, setScores] = useState({ human: 0, bot: 0 });
  const [scoreChange, setChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHumanEmojis, setShowHumanEmojis] = useState(false);
  const [showBotEmojis, setShowBotEmojis] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(false);
  const videoRef = useRef(null);

  // Function to reset the inactivity timer
  // Reference to hold the inactivity timer ID
  const inactivityTimerRef = useRef(null);
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
    setChange(false);

    // Cleanup function to clear the timer when the component unmounts
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [scoreChange, resetInactivityTimer]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const fetchedScores = await fetchScoresFromAPI();
        setScores((prevScores) => {
          if (fetchedScores.human > prevScores.human) {
            setShowHumanEmojis(true);
            setTimeout(() => setShowHumanEmojis(false), 15000);
            // Show the video background
            setShowVideoBackground(true);
            setChange(true);
          } else if (fetchedScores.bot > prevScores.bot) {
            setShowBotEmojis(true);
            setTimeout(() => setShowBotEmojis(false), 15000);
            setChange(true);
          } else {
            setShowHumanEmojis(false);
            setShowBotEmojis(false);
          }
          return fetchedScores;
        });
        setError(null);
      } catch (err) {
        setError("Failed to fetch scores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    const intervalId = setInterval(fetchScores, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // // Handle video end event
  // const handleVideoEnd = () => {
  //   setShowVideoBackground(false);
  // };

  return (
    <div className="App">
      {showVideoBackground && (
        <div className="video-background">
          <video
            id="bg-video"
            ref={videoRef}
            muted
            autoPlay
            loop
          >
            <source src="assets/video.mp4" type="video/mp4" />
            {/* Add additional sources if needed */}
          </video>
        </div>
      )}
      {showHumanEmojis && <EmojiRain type="human" />}
      {showBotEmojis && <EmojiRain type="bot" />}
      <div className={`scoreboard ${showHumanEmojis ? "party" : ""}`}>
        {/* <h1>Let's save the world with tech</h1> */}
        {loading && <p>Loading scores...</p>}
        {error && <p className="error">{error}</p>}
        <div className="scores">
          <div className="score-item">
            <span>HUMANS</span>
            <div className="score-human">{scores.human}</div>
          </div>
          <div className="score-item">
            <span>TECH</span>
            <div className="score-bot">{scores.bot}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
