import React, { useState } from "react";
import SolutionSelection from './SolutionSelection';
import "./BottomCarousel.css";

const base_solutions = [  
  "Blockchain",
  "AI", 
  "Increase awareness",
  "Fill in your own idea"
];

// TODO: make a chat layout, where the response of the bot is displayed in a chat bubble, as if coming from a bot named ELIZA, and the user's input is displayed in a chat bubble as if coming from a user named HUMAN, the human response is the selectedSolution, and the selectedChallenge


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
    attemptNumber
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
      <div className={`bottom-carousel active ${(showManualInput || attemptNumber>=2)? 'manual-input-active' : ''}`}>
          <div className="carousel-content-bottom">
          <SolutionSelection
            attemptNumber={attemptNumber}
            showManualInput={showManualInput}
            manualSolution={manualSolution}
            setManualSolution={setManualSolution}
            canSubmitNewSolution={canSubmitNewSolution}
            handleManualSubmit={handleManualSubmit}
            base_solutions={base_solutions}
            selectedSolution={selectedSolution}
            handleSolutionClick={handleSolutionClick}
          /> 
          </div>
        </div>
    </div>
  );
}

export default BottomCarousel;
