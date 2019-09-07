import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { testPingInfoThunk, testPing } from "@store/test.duck";

interface Props { }

const Home: React.FunctionComponent<Props> = _props => {
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("mount");
    getLabel();
    return () => console.log("unmount");
  }, []);

  useEffect(() => {
    console.log("hot-reload", { count });
    getLabel();
    return () => console.log("hot-unload", { count });
  }, ["hot"]);

  const getLabel = () => {
    const nextLabel = dispatch(testPingInfoThunk({}));
    setLabel(nextLabel);
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button onClick={() => dispatch(testPing.act({}))}>ping</button>
        <div>{count}</div>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
      <div style={{ display: "flex" }}>
        <button onClick={getLabel}>update</button>
        {label}
      </div>
    </div>
  );
};

export default Home;