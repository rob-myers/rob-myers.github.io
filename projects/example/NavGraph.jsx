import { useQuery } from "react-query";
import { css } from "goober";

import * as defaults from './defaults';
import { geomorphJsonPath, geomorphPngPath } from "../geomorph/geomorph.model";
import PanZoom from "../panzoom/PanZoom";

/** @param {{ layoutKey: Geomorph.LayoutKey }} props */
export default function NavGraphDemo(props) {

  const { data } = useQuery(`${props.layoutKey}-json`, async () => {
    /** @type {Promise<Geomorph.GeomorphJson>} */
    return (fetch(geomorphJsonPath(props.layoutKey)).then(x => x.json()));
  });

  return data ? (
    <PanZoom
      gridBounds={defaults.gridBounds}
      initViewBox={defaults.initViewBox}
      maxZoom={6}
      className={rootCss}
    >
      <image {...data.pngRect} className="geomorph" href={geomorphPngPath(props.layoutKey)} />
    </PanZoom>
  ) : null;
}

const rootCss = css`

`;
