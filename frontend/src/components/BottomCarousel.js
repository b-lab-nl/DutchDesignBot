// BottomCarousel.js

import React, { useState } from 'react';
import './BottomCarousel.css';

const solutions = [
  'Invest in Renewables',
  'Promote Education',
  'Support Local Farmers',
  'Implement AI Ethics',
  'Strengthen Privacy Laws',
  'Fill in your idea',
];

function BottomCarousel(props) {
  const {
    selectedSolution,
    setSelectedSolution,
    preFilled,
    setPreFilled,
    showManualInput,
    setShowManualInput,
    attemptNumber,
    setAttemptNumber,
  } = props;

  const [manualSolution, setManualSolution] = useState('');

  const handleSolutionClick = solution => {
    if (solution === 'Fill in your idea') {
      setShowManualInput(true);
      setPreFilled(false);
    } else {
      setSelectedSolution(solution);
      setPreFilled(true);
      setAttemptNumber(prev => prev + 1);
    }
  };

  const handleManualSubmit = () => {
    if (manualSolution.trim() !== '') {
      setSelectedSolution(manualSolution);
      setPreFilled(false);
      setShowManualInput(false);
    }
  };

  return (
    <div className="bottom-carousel">
      <div className="carousel-content">
        {solutions.concat(solutions).map((solution, index) => (
          <div
            key={index}
            className={`carousel-item ${selectedSolution === solution ? 'selected' : ''}`}
            onClick={() => handleSolutionClick(solution)}
          >
            {solution}
          </div>
        ))}
        {showManualInput && (
          <div className="manual-input">
            <input
              type="text"
              value={manualSolution}
              onChange={e => setManualSolution(e.target.value)}
              placeholder="Enter your solution"
            />
            <button onClick={handleManualSubmit}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BottomCarousel;
