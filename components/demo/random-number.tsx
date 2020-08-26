import { useState } from "react";

const RandomNumber: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState(0);
  return (
    <div>
      {randomNumber} &nbsp;
      <button onClick={() => setRandomNumber(generateRandomNumber())}>
        generate
      </button>
    </div>
  );
};

function generateRandomNumber() {
  return Math.trunc(Math.random() * 100);
}

export default RandomNumber;
