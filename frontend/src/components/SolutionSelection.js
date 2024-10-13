import React from 'react';

const SolutionSelection = ({ 
  attemptNumber,
  showManualInput, 
  manualSolution, 
  setManualSolution, 
  canSubmitNewSolution, 
  handleManualSubmit,
  base_solutions,
  selectedSolution,
  handleSolutionClick,
  selectedChallenge
}) => {
  if (showManualInput || attemptNumber >= 2) {
    return (
      <div className="manual-input-container">
        <div className="manual-input">
          <div className='manual-input-header'>ENTER AN UNEXPECTED SOLUTION</div>
          <div>
          <input
            type="text"
            value={manualSolution}
            onChange={(e) => setManualSolution(e.target.value)}
            placeholder={`${selectedChallenge} + ..`}
            disabled={!canSubmitNewSolution}
          />
          </div>
        </div>
        <div 
          className='carousel-item-bottom button' 
          onClick={handleManualSubmit}
          style={{ cursor: canSubmitNewSolution ? 'pointer' : 'not-allowed' }}
        >
          OK
        </div>
      </div>
    );
  } else {
    return (
      <div className="base-solutions-container">
        {base_solutions.map((solution, index) => (
          <div
            key={index}
            className={`carousel-item-bottom ${
              selectedSolution === solution ? "selected" : ""
            } ${!canSubmitNewSolution ? "disabled" : ""}`}
            onClick={() => handleSolutionClick(solution)}
          >
            {solution}
          </div>
        ))}
      </div>
    );
  }
};

export default SolutionSelection;