import { useQuery } from "react-query";
import PanZoom from "../panzoom/PanZoom";
import { gridBounds, initViewBox } from "./defaults";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function ThreeDDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(`/geomorph/${props.layoutKey}.json`).then(x => x.json()));
  });


  return (
    <PanZoom
      gridBounds={gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
      // className={rootCss}
    >

      {data &&
        <image
        {...data.pngRect}
        className="geomorph"
        href={`/geomorph/${props.layoutKey}.png`}
        />
      }
    </PanZoom>
  );
}
