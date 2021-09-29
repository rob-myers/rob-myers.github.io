export class EdgeHierarchy {

  /**
   * @param {Raycast.Mesh} mesh
   */
  constructor(mesh) {
    /** @type {Raycast.Mesh} */
    this.mesh = mesh;

    /** @type {Triple<Geom.Vect>[]} */
    this.tris = mesh.ts.flatMap(x => x.tris.map(ids =>
      /** @type {Triple<Geom.Vect>} */ (ids.map(id => x.vs[id])))
    );
    /** @type {Geom.Seg[]} */
    this.segs = this.tris.flatMap((xs, i) => xs.map(x => ({ src: x, dst: xs[(i + 1) % 3] })));
  }


}