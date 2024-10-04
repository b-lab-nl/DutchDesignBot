import React, { useState } from "react";
import "./BottomCarousel.css";

const base_solutions = [
  "Fill in your own idea",
  "Invest in Renewables",
  "Promote Education",
  "More regulations",
  "Eat less meat",
  "Recycle more",
];

const solutions = [...base_solutions, ...base_solutions, ...base_solutions];

function BottomCarousel(props) {
  const {
    selectedChallenge,
    selectedSolution,
    setSelectedSolution,
    preFilled,
    setPreFilled,
    showManualInput,
    setShowManualInput,
    canSubmitNewSolution,
  } = props;

  const [manualSolution, setManualSolution] = useState("");

  const handleSolutionClick = (solution) => {
    if (canSubmitNewSolution) {
      if (solution === "Fill in your own idea") {
        setShowManualInput(true);
        setPreFilled(false);
      } else {
        setSelectedSolution(solution);
        setPreFilled(true);
      }
    }
  };

  const handleManualSubmit = () => {
    if (canSubmitNewSolution && manualSolution.trim() !== "") {
      setSelectedSolution(manualSolution);
      setPreFilled(false);
      setShowManualInput(false);
    }
  };

  return (
    <div className="bottom-carousel-div">
      <div className="bottom-carousel active">
        <div className="carousel-content-bottom">
          {showManualInput && (
            <div className="manual-input">
              <input
                type="text"
                value={manualSolution}
                onChange={(e) => setManualSolution(e.target.value)}
                placeholder="Enter your solution"
                disabled={!canSubmitNewSolution}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!canSubmitNewSolution}
              >
                I dare you..
              </button>
            </div>
          )}
          <div className="carousel-scrolling-content">
            {solutions.concat(solutions).map((solution, index) => (
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
        </div>
      </div>
    </div>
  );
}

export default BottomCarousel;
