import React, { useState } from "react";

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
  selectedChallenge,
  setIsHoveredOnOther,
  selectedSolutions,
}) => {
  const handleMouseEnter = (solution) => {
    if (solution === "Other") {
      setIsHoveredOnOther(true);
    }
  };

  const handleMouseLeave = (solution) => {
    if (solution === "Other") {
      setIsHoveredOnOther(false);
    }
  };

  if (showManualInput) {
    return (
      <div className="manual-input-container">
        <div className="manual-input">
          <div className="manual-input-header">
            Enter an unexpected solution
          </div>
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
          className="carousel-item-bottom button"
          onClick={handleManualSubmit}
          style={{ cursor: canSubmitNewSolution ? "pointer" : "not-allowed" }}
        >
          OK
        </div>
      </div>
    );
  } else {
    return (
      <div className="base-solutions-container">
        {base_solutions.map((solution, index) => {
          const isSelected = selectedSolutions.includes(solution);
          const isDisabled = !canSubmitNewSolution || isSelected;

          return (
            <div
              key={index}
              className={`carousel-item-bottom ${
                selectedSolution === solution ? "selected" : ""
              } ${isDisabled ? "disabled" : ""}`}
              onClick={() => {
                if (!isDisabled) {
                  handleSolutionClick(solution);
                }
              }}
              onMouseEnter={() => handleMouseEnter(solution)}
              onMouseLeave={() => handleMouseLeave(solution)}
              style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
            >
              {solution}
            </div>
          );
        })}
      </div>
    );
  }
};

export default SolutionSelection;
