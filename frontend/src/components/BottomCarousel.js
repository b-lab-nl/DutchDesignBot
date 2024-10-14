import React, { useState } from "react";
import SolutionSelection from "./SolutionSelection";
import "./BottomCarousel.css";

const base_solutions_dict = {
  Inclusivity: ["Blockchain", "AI", "Digital accessibility tools"],
  Safety: ["Cybersecurity", "AI", "Smart surveillance"],
  Healthcare: ["Remote monitoring", "AI", "3D printing"],
  Housing: ["3D printing", "Smart building materials", "Modular construction"],
  Energy: ["3D printing", "Renewable energy", "AI"],
  Water: ["Lab-grown", "Vertical farming", "AI agriculture"],
  Food: ["AI", "Blockchain", "Vertical farming"],
};

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
    attemptNumber,
  } = props;

  // Append with Other
  const base_solutions = base_solutions_dict[selectedChallenge].concat("Other");

  const [manualSolution, setManualSolution] = useState("");

  const handleSolutionClick = (solution) => {
    if (canSubmitNewSolution) {
      if (solution === "Other") {
        setSelectedSolution("");
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
      <div
        className={`bottom-carousel active ${showManualInput ? "manual-input-active" : ""}`}
      >
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
            selectedChallenge={selectedChallenge}
          />
        </div>
      </div>
    </div>
  );
}

export default BottomCarousel;
