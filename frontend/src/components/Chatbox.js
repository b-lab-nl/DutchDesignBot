import React, { useEffect, useRef, useState } from "react";
import "./Chatbox.css";

function chatbox({
  selectedChallenge,
  selectedSolution,
  botResponse,
  oGscore,
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
      const arrowHeight = 50; // height of the arrow
      const arrowWidth = 20; // width of the arrow

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
      ctx.lineTo(arrowTipX, arrowTipY + arrowHeight + 40); // 40 is the length of the shaft

      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`; // Set color and opacity
      ctx.lineWidth = 5; // Set the arrow thickness
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
      ctx.font = "24px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fillText(
        "Select your challenge",
        canvas.width / 2,
        canvas.height / 2 - 50,
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
    const words = text.split(" ");
    let index = 0;

    function addWord() {
      if (index < words.length) {
        const span = document.createElement("span");
        const word = words[index];

        if (word === "\n") {
          // Create a line break if we encounter a new line marker
          container.appendChild(document.createElement("br"));
        } else {
          const span = document.createElement("span");
          span.textContent = word + " ";
          span.style.opacity = "0";
          span.style.animation = `fadeIn 0.6s ease forwards`;
          container.appendChild(span);
        }
        index++;

        // Use requestAnimationFrame for better performance
        setTimeout(addWord, 150);
      }
    }
    addWord();
  }

  useEffect(() => {
    if (botResponse) {
      let ScoreText;
      if (oGscore !== null && oGscore !== undefined) {
        // add right arrow and OG score to the bot response
        ScoreText = `${botResponse} \n\n=> Your OG score is now: ${oGscore}`;
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
