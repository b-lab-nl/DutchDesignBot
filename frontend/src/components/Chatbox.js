import React, { useEffect, useRef, useState } from "react";
import "./Chatbox.css";

function chatbox({
  selectedChallenge,
  selectedSolution,
  botResponse,
  oGscore,
  attemptNumber,
  isLoading,
}) {
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const botResponseRef = useRef(null);
  const humanResponseRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setCanvasContext(ctx);
    let animationFrameId;
    let opacity = 1;
    let fadingIn = false;

    const drawArrow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const arrowHeight = 10; // height of the arrow
      const arrowWidth = 10; // width of the arrow

      // Coordinates for the arrow tip
      const arrowTipX = canvas.width / 2;
      const arrowTipY = canvas.height / 2 - 180; // Position the arrow above the text

      ctx.beginPath();
      // Move to the tip of the arrow
      ctx.moveTo(arrowTipX, arrowTipY);

      // Draw the left side of the arrow
      ctx.lineTo(arrowTipX - arrowWidth / 2, arrowTipY + arrowHeight);

      // Draw the right side of the arrow
      ctx.lineTo(arrowTipX + arrowWidth / 2, arrowTipY + arrowHeight);

      // Draw back to the tip of the arrow
      ctx.lineTo(arrowTipX, arrowTipY);

      // Draw the arrow's vertical line (shaft)
      ctx.moveTo(arrowTipX, arrowTipY + arrowHeight);
      ctx.lineTo(arrowTipX, arrowTipY + arrowHeight + 20); // 40 is the length of the shaft

      ctx.strokeStyle = `rgba(0, 0, 0, 0)`; // Set color and opacity
      // ctx.fill()
      ctx.lineWidth = 2; // Set the arrow thickness
      ctx.stroke();
      if (fadingIn) {
        opacity += 0.02;
        if (opacity >= 1) fadingIn = false;
      } else {
        opacity -= 0.02;
        if (opacity <= 0) fadingIn = true;
      }
    };

    const drawText = () => {
      ctx.font = "16px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(0, 0, 0, 0)`;
      ctx.fillText(
        "PICK A QUEST TO START ⬆",
        canvas.width / 2,
        canvas.height / 2 - 150,
      );

      if (fadingIn) {
        opacity += 0.02;
        if (opacity >= 1) fadingIn = false;
      } else {
        opacity -= 0.02;
        if (opacity <= 0) fadingIn = true;
      }
    };

    const animate = () => {
      if (!botResponse && !selectedChallenge) {
        drawArrow();
        drawText();
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedChallenge, isLoading]);

  function animateText(text, container) {
    container.innerHTML = ""; // Clear previous content

    // Split the text into words, preserving spaces and tabs, but not line breaks
    const words = text.split(/([ \t]+)/);

    let index = 0;
    let wordCount = 0; // Initialize word counter
    let justAddedLineBreak = false; // Flag to track line breaks

    function addWord() {
      if (index < words.length) {
        let word = words[index];

        if (word.includes("\n")) {
          // Split the word further on line breaks
          const parts = word.split("\n");

          parts.forEach((part, i) => {
            if (part) {
              // Trim leading spaces from the part
              if (justAddedLineBreak) {
                part = part.replace(/^[ \t]+/, "");
              }

              // Add the word part
              const span = document.createElement("span");
              span.textContent = part;
              span.style.opacity = "0";
              span.style.animation = `fadeIn 0.6s ease forwards`;
              container.appendChild(span);

              if (part.trim() !== "") {
                wordCount++;
                justAddedLineBreak = false; // Reset flag after adding a word
              }

              // After adding the word, check if we need to add a line break
              if (wordCount >= 5) {
                container.appendChild(document.createElement("br"));
                wordCount = 0; // Reset word count
                justAddedLineBreak = true; // Set flag after adding line break
              }
            }

            if (i < parts.length - 1) {
              // Add a line break when encountering a '\n'
              container.appendChild(document.createElement("br"));
              wordCount = 0; // Reset word count due to existing line break
              justAddedLineBreak = true; // Set flag after adding line break
            }
          });
        } else if (word.trim() === "") {
          // Handle spaces and tabs
          if (!justAddedLineBreak) {
            const span = document.createElement("span");
            span.innerHTML = "&nbsp;";
            span.style.opacity = "0";
            span.style.animation = `fadeIn 0.6s ease forwards`;
            container.appendChild(span);
          }
        } else {
          // Trim leading spaces if a line break was just added
          if (justAddedLineBreak) {
            word = word.replace(/^[ \t]+/, "");
            justAddedLineBreak = false; // Reset flag after adding a word
          }

          // Regular word
          const span = document.createElement("span");
          span.textContent = word;
          span.style.opacity = "0";
          span.style.animation = `fadeIn 0.6s ease forwards`;
          container.appendChild(span);

          wordCount++;

          // After adding the word, check if we need to add a line break
          if (wordCount >= 5) {
            container.appendChild(document.createElement("br"));
            wordCount = 0; // Reset word count
            justAddedLineBreak = true; // Set flag after adding line break
          }
        }

        index++;

        // Skip any spaces or tabs immediately after a line break
        if (justAddedLineBreak) {
          // Look ahead to the next word
          while (index < words.length && words[index].trim() === "") {
            index++;
          }
        }

        // Use requestAnimationFrame or setTimeout for better performance
        setTimeout(addWord, 150);
      }
    }

    addWord();
  }

  useEffect(() => {
    if (botResponse) {
      let ScoreText;
      if (
        oGscore !== null &&
        oGscore !== undefined &&
        selectedSolution !== ""
      ) {
        // add right arrow and OG score to the bot response
        ScoreText = `${botResponse} \n\nOriginality score: ${oGscore}% \nAttempt number: ${attemptNumber}`;
      } else {
        ScoreText = botResponse;
      }
      animateText(ScoreText, botResponseRef.current);
    }
  }, [botResponse, oGscore]);

  useEffect(() => {
    if (selectedSolution) {
      animateText(selectedSolution, humanResponseRef.current);
    }
  }, [selectedSolution]);

  useEffect(() => {
    if (!isLoading && canvasContext) {
      canvasContext.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
    }
  }, [isLoading, canvasContext]);

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
export default chatbox;
