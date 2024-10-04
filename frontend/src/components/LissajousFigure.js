import React, { useEffect, useRef, useState } from "react";
import "./LissajousFigure.css";

function LissajousFigure({
  selectedChallenge,
  selectedSolution,
  botResponse,
  isLoading,
}) {
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setCanvasContext(ctx);
    let animationFrameId;
    let opacity = 1;
    let fadingIn = false;

    // Snake animation variables
    let snakeX = canvas.width / 2;
    let snakeY = canvas.height / 2;
    let snakeAngle = 0;
    const snakeSpeed = 2;
    const trailOpacity = 0.3;
    let dirX = 0;
    let dirY = 0;
    let stepCount = 0;
    let randStepInterval = 50;

    const drawText = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
      ctx.fillText(
        "Select your challenge",
        canvas.width / 2,
        canvas.height / 2,
      );

      if (fadingIn) {
        opacity += 0.02;
        if (opacity >= 1) fadingIn = false;
      } else {
        opacity -= 0.02;
        if (opacity <= 0) fadingIn = true;
      }
    };

    const drawSnake = () => {
      // Update snake position
      snakeAngle += 0.05;
      stepCount += 1;
      if (stepCount % randStepInterval === 0) {
        dirX = Math.round(Math.random());
        dirY = Math.round(Math.random());
        randStepInterval = Math.floor(Math.random() * 100) + 50;
      }
      if (stepCount > 100_000) stepCount = 0;

      const newX = snakeX + (1 / 2 - dirX) * snakeSpeed;
      const newY = snakeY + (1 / 2 - dirY) * snakeSpeed;

      // Draw trail
      ctx.beginPath();
      ctx.moveTo(snakeX, snakeY);
      ctx.lineTo(newX, newY);
      ctx.strokeStyle = `rgba(0, 255, 0, ${trailOpacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update snake position
      snakeX = newX;
      snakeY = newY;

      // Wrap snake around canvas edges
      if (snakeX < 0) snakeX = canvas.width;
      if (snakeX > canvas.width) snakeX = 0;
      if (snakeY < 0) snakeY = canvas.height;
      if (snakeY > canvas.height) snakeY = 0;

      // Draw snake head
      ctx.beginPath();
      ctx.arc(snakeX, snakeY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "lightgreen";
      ctx.fill();
    };

    const animate = () => {
      if (!selectedChallenge) {
        drawSnake();
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

  const wrapperClassName = botResponse
    ? "lissajous-canvas-wrapper expanded"
    : "lissajous-canvas-wrapper";

  return (
    <div className={wrapperClassName}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="lissajous-canvas"
      />
      {botResponse && <div className="bot-response-overlay">{botResponse}</div>}
    </div>
  );
}

export default LissajousFigure;
