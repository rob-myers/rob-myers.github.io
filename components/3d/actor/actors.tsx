import { useEffect } from "react";

const Actors: React.FC = () => {

  useEffect(() => {
    /**
     * TODO move actors along paths when requested,
     * using tweenjs
     */
  }, []);

  return (
    <group name="actors"/>
  );
};

export default Actors;
