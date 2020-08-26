import { useState } from "react";

const RandomNumber: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState(0);
  return (
    <section style={{ padding: 10 }}>
      random: <strong>{randomNumber}</strong> &nbsp;
      <button onClick={() => setRandomNumber(generateRandomNumber())}>
        generate
      </button>
    </section>
  );
};

function generateRandomNumber() {
  return Math.trunc(Math.random() * 100);
}

export default RandomNumber;
