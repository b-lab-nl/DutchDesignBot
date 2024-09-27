// LissajousFigure.js

import React, { useEffect, useRef } from 'react';
import './LissajousFigure.css';

function LissajousFigure({ selectedChallenge, selectedSolution }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let t = 0;

    const drawFigure = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const x = canvas.width / 2 + 100 * Math.sin(3 * t);
      const y = canvas.height / 2 + 100 * Math.sin(4 * t);
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      t += 0.02;
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

  return <canvas ref={canvasRef} width={400} height={400} className="lissajous-canvas" />;
}

export default LissajousFigure;
