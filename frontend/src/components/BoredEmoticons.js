import React, { useEffect, useState } from "react";
import "./BoredEmoticons.css";

const BoredEmoticons = () => {
  const [emoticons, setEmoticons] = useState([]);

  useEffect(() => {
    const createEmoticon = () => {
      const newEmoticon = {
        id: Math.random(),
        left: Math.random() * 100,
        animationDuration: 6 + Math.random() * 2,
      };
      setEmoticons((prev) => [...prev, newEmoticon]);
    };

    const interval = setInterval(createEmoticon, 200);
    const cleanup = setTimeout(() => {
      clearInterval(interval);
      setEmoticons([]);
    }, 8_000);

    return () => {
      clearInterval(interval);
      clearTimeout(cleanup);
    };
  }, []);

  return (
    <div className="bored-emoticons">
      {emoticons.map((emoticon) => (
        <div
          key={emoticon.id}
          className="emoticon"
          style={{
            left: `${emoticon.left}%`,
            animationDuration: `${emoticon.animationDuration}s`,
          }}
        >
          😴
        </div>
      ))}
    </div>
  );
};

export default BoredEmoticons;
