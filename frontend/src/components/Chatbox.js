import React, { useEffect, useRef } from "react";
import "./Chatbox.css";

function Chatbox({
  selectedChallenge,
  selectedSolution,
  botResponse,
  oGscore,
  attemptNumber,
  isLoading,
}) {
  const canvasRef = useRef(null);
  const botResponseRef = useRef(null);
  const humanResponseRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
    };

    setupCanvas();

    const drawText = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 48px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillText(
        "PICK A QUEST TO START ⬆",
        canvas.width / (2 * window.devicePixelRatio),
        canvas.height / (2 * window.devicePixelRatio) - 150
      );
    };

    if (!botResponse && !selectedChallenge) {
      drawText();
    }

    const handleResize = () => {
      setupCanvas();
      if (!botResponse && !selectedChallenge) {
        drawText();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedChallenge, botResponse]);

  function animateText(text, container) {
    container.innerHTML = "";
    const words = text.split(/([ \t]+)/);
    let index = 0;
    let wordCount = 0;
    let justAddedLineBreak = false;

    function addWord() {
      if (index < words.length) {
        let word = words[index];

        if (word.includes("\n")) {
          const parts = word.split("\n");

          parts.forEach((part, i) => {
            if (part) {
              if (justAddedLineBreak) {
                part = part.replace(/^[ \t]+/, "");
              }

              const span = document.createElement("span");
              span.textContent = part;
              span.style.opacity = "0";
              span.style.animation = `fadeIn 0.6s ease forwards`;
              container.appendChild(span);

              if (part.trim() !== "") {
                wordCount++;
                justAddedLineBreak = false;
              }

              if (wordCount >= 5) {
                container.appendChild(document.createElement("br"));
                wordCount = 0;
                justAddedLineBreak = true;
              }
            }

            if (i < parts.length - 1) {
              container.appendChild(document.createElement("br"));
              wordCount = 0;
              justAddedLineBreak = true;
            }
          });
        } else if (word.trim() === "") {
          if (!justAddedLineBreak) {
            const span = document.createElement("span");
            span.innerHTML = "&nbsp;";
            span.style.opacity = "0";
            span.style.animation = `fadeIn 0.6s ease forwards`;
            container.appendChild(span);
          }
        } else {
          if (justAddedLineBreak) {
            word = word.replace(/^[ \t]+/, "");
            justAddedLineBreak = false;
          }

          const span = document.createElement("span");
          span.textContent = word;
          span.style.opacity = "0";
          span.style.animation = `fadeIn 0.6s ease forwards`;
          container.appendChild(span);

          wordCount++;

          if (wordCount >= 5) {
            container.appendChild(document.createElement("br"));
            wordCount = 0;
            justAddedLineBreak = true;
          }
        }

        index++;

        if (justAddedLineBreak) {
          while (index < words.length && words[index].trim() === "") {
            index++;
          }
        }

        setTimeout(addWord, 150);
      }
    }

    addWord();
  }

  useEffect(() => {
    if (botResponse) {
      let ScoreText;
      if (oGscore !== null && oGscore !== undefined) {
        ScoreText = `${botResponse} \n\nOriginality score: ${oGscore}% \nAttempt number: ${attemptNumber}`;
      } else {
        ScoreText = botResponse;
      }
      animateText(ScoreText, botResponseRef.current);
    }
  }, [botResponse, oGscore, attemptNumber]);

  useEffect(() => {
    if (selectedSolution) {
      animateText(selectedSolution, humanResponseRef.current);
    }
  }, [selectedSolution]);

  const wrapperClassName =
    selectedChallenge || selectedSolution
      ? "chatbox-canvas-wrapper selected"
      : botResponse
      ? "chatbox-canvas-wrapper expanded"
      : "chatbox-canvas-wrapper";

  return (
    <div className={wrapperClassName}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="chatbox-canvas"
      />
      {botResponse && (
        <div className="bot-response-overlay">
          <div ref={botResponseRef} className="word-animation"></div>
        </div>
      )}
      {selectedSolution && (
        <div className="human-response-overlay">
          <div ref={humanResponseRef} className="word-animation"></div>
        </div>
      )}
    </div>
  );
}

export default Chatbox;