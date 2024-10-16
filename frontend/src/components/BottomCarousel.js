import React, { useState } from "react";
import SolutionSelection from "./SolutionSelection";
import "./BottomCarousel.css";

const base_solutions_dict = {
  Inclusivity: [
    "Blockchain voting",
    "AI language translation",
    "Digital twins",
  ],
  Safety: ["Biometric authentication", "Smart drones", "Behaviorial analytics"],
  Healthcare: ["AI drug discovery", "Wearables", "Telemedicine robots"],
  Housing: [
    "AI for urban planning",
    "Floating modular homes",
    "IoT-enabled smart homes",
  ],
  Energy: [
    "AI-driven smart grid",
    "Blockchain energy trading",
    "Consumption monitoring",
  ],
  Water: [
    "Renewable water purification",
    "AI to predict water scarcity",
    "Fog harvesting",
  ],
  Food: ["AI precision agriculture", "Vertical farming", "Lab grown protein"],
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
    isHoveredOnOther,
    setIsHoveredOnOther,
  } = props;

  // Append with Other
  const base_solutions = base_solutions_dict[selectedChallenge].concat("Other");
  const [selectedSolutions, setSelectedSolutions] = useState([]);

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
        // Add selected solution to the list
        setSelectedSolutions((prevSelectedSolutions) => [
          ...prevSelectedSolutions,
          solution,
        ]);
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
        className={`bottom-carousel active ${showManualInput || isHoveredOnOther ? "manual-input-active" : ""}`}
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
            setIsHoveredOnOther={setIsHoveredOnOther}
            selectedSolutions={selectedSolutions}
          />
        </div>
      </div>
    </div>
  );
}

export default BottomCarousel;
