declare module 'poly-parse' {
  import { TriangulateIO } from "triangle-wasm";

  interface Options {
    /** Flatten nested arrays e.g. pointlist (default `false`) */
    flat?: boolean;
    /** Multiply y ordinates by -1 (default `false`) */
    flipY?: boolean;
    /** Normalize path to bounding box `[-1, 1] * [-1, 1]` (default `false`) */
    normalize?: boolean;
    /**
     * Plus all options from [Papa parse](https://www.papaparse.com/docs#config).
     */
  }

  function polyParse(
    polyFileContents: string,
    options?: Options,
  ): TriangulateIO

  export = polyParse;
}
