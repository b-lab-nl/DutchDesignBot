// TopCarousel.js

import React from 'react';
import './TopCarousel.css';

const challenges = [
  'Inclusivity',
  'Safety',
  'Healthcare',
  'Housing',
  'Energy',
  'Water',
  'Food'
];

function TopCarousel({ selectedChallenge, setSelectedChallenge }) {
  return (
    <div className="top-carousel">
      <div className="carousel-content">
        {challenges.concat(challenges).map((challenge, index) => (
          <div
            key={index}
            className={`carousel-item ${selectedChallenge === challenge ? 'selected' : ''}`}
            onClick={() => setSelectedChallenge(challenge)}
          >
            <span className='challengeText'>{challenge}</span>
          </div>
        ))}
      </div>
      <div className="carousel-cta-text">Pick a quest to start ⬆</div>
    </div>
  );
}

export default TopCarousel;
