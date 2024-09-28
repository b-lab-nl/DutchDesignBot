// LissajousFigure.js

import React, { useEffect, useRef } from 'react';
import './LissajousFigure.css';

function LissajousFigure({ selectedChallenge, selectedSolution, botResponse}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let t = 0;

    const drawFigure = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const x = 5; // canvas.width / 2 + 50 * Math.sin(3 * t);
      const y = canvas.height / 2 + 200 * Math.sin(4 * t);
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
      t += 0.01;
    };

    const render = () => {
      drawFigure();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedChallenge, selectedSolution]);

  const wrapperClassName = botResponse
  ? 'lissajous-canvas-wrapper expanded'
  : 'lissajous-canvas-wrapper';
  
  return (
    <div className={wrapperClassName}>
      <canvas ref={canvasRef} width={botResponse ? 600 : 10} height={400} className="lissajous-canvas" />
      {botResponse && (
        <div className="bot-response-overlay">
          {botResponse}
        </div>
      )}
    </div>
  );
}

export default LissajousFigure;
