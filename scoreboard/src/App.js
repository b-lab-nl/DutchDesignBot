import React, { useState, useEffect } from "react";
import "./App.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:1232";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHumanEmojis, setShowHumanEmojis] = useState(false);
  const [showBotEmojis, setShowBotEmojis] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const fetchedScores = await fetchScoresFromAPI();
        setScores((prevScores) => {
          if (fetchedScores.human > prevScores.human) {
            setShowHumanEmojis(true);
            setTimeout(() => setShowHumanEmojis(false), 15000);
            // TODO: change background color for .scoreboard to #A2B0FE
          }
          if (fetchedScores.bot > prevScores.bot) {
            setShowBotEmojis(true);
            setTimeout(() => setShowBotEmojis(false), 15000);
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

  return (
    <div className="App">
      {showHumanEmojis && <EmojiRain type="human" />}
      {showBotEmojis && <EmojiRain type="bot" />}
      <div className={`scoreboard ${showHumanEmojis ? "party" : ""}`}>
        <h1>Let's save the world with tech</h1>
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
