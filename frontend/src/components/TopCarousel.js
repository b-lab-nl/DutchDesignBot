// TopCarousel.js

import React from 'react';
import './TopCarousel.css';

const challenges = [
  'Climate Change',
  'Environmental Destruction',
  'Energy Shortage',
  'Water Shortage',
  'Inequality',
  'World Hunger',
  'Rise of Fascism',
  'Loss of Privacy',
  'Rogue AGI',
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
    </div>
  );
}

export default TopCarousel;
