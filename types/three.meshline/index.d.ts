declare module 'three.meshline' {
  import 'three';

  class MeshLine extends THREE.BufferGeometry {
    setPoints(
      points: THREE.Vector3[] | THREE.Geometry,
      lineWidth?: (i: number) => number,
    );
  }

  class MeshLineMaterial extends THREE.Material {
    constructor(opts: Partial<Options>) {}
  }

  interface Options {
    /** A THREE.Texture to paint along the line (requires useMap set to true) */
    map?: THREE.Texture; 
    /** Tells the material to use map (0 - solid color, 1 use texture) */
    useMap?: boolean;
    /** A THREE.Texture to use as alpha along the line (requires useAlphaMap set to true) */
    alphaMap?: THREE.Texture;
    /** Tells the material to use alphaMap (0 - no alpha, 1 modulate alpha) */
    useAlphaMap?: boolean;
    /** THREE.Vector2 to define the texture tiling (applies to map and alphaMap - MIGHT CHANGE IN THE FUTURE) */
    repeat?: THREE.Vector2;
    /** THREE.Color to paint the line width, or tint the texture with */
    color?: THREE.Color;
    /** Alpha value from 0 to 1 (requires transparent set to true) */
    opacity?: number;
    /** Cutoff value from 0 to 1 */
    alphaTest?: number;
    /** The length and space between dashes. (0 - no dash) */
    dashArray?: number;
    /** Defines the location where the dash will begin. Ideal to animate the line. */
    dashOffset?: number;
    /** Defines the ratio between that is visible or not (0 - more visible, 1 - more invisible). */
    dashRatio?: number;
    /** THREE.Vector2 specifying the canvas size (REQUIRED) */
    resolution?: THREE.Vector2;
    /** Makes the line width constant regardless distance (1 unit is 1px on screen) (0 - attenuate, 1 - don't attenuate) */
    sizeAttenuation?: boolean;
    /** Float defining width (if sizeAttenuation is true, it's world units; else is screen pixels) */
    lineWidth?: number;
  }

  class MeshLineRaycast {}
}
