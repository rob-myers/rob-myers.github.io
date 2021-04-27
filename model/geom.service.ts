import * as THREE from 'three';
import polygonClipping from 'polygon-clipping';

import { range, Triple, tryParseJson } from 'model/generic.model';
import { Geometry, Face3 } from 'model/3d/deprecated';
import * as Geom from 'model/geom';

const twopi = 2 * Math.PI;
const defaultLineWidth = 0.015;

// TODO probably remove these constants
export const outsetWalls = 0.04;
export const outsetBounds = 0.1;

class GeomService {

  private colorCache = {} as Record<string, THREE.Color>;
  private lineMatCache = {} as Record<string, THREE.MeshBasicMaterial>;
  private tempBox = new THREE.Box3;
  private whiteMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  private getBasicMat(color: string, opacity: number) {
    const key = JSON.stringify({ color, opacity });
    const material = this.lineMatCache[key] || (
      this.lineMatCache[key] = new THREE.MeshBasicMaterial({
        color: this.getColor(color),
        opacity,
      })
    );
    material.transparent = opacity < 1;
    return material;
  }

  applyMatrixVect(matrix: THREE.Matrix4, vector: Geom.Vector) {
		const x = vector.x, y = vector.y;
		const e = matrix.elements;
		vector.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * 0 + e[ 12 ] );
		vector.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * 0 + e[ 13 ] );
    return vector;
  }

  /** Mutates `poly` */
  applyMatrixPoly(matrix: THREE.Matrix4, poly: Geom.Polygon) {
    poly.mutatePoints(v => this.applyMatrixVect(matrix, v));
    return poly;
  }

  /** Mutates `rect` */
  applyMatrixRect(matrix: THREE.Matrix4, rect: Geom.Rect) {
    const [p, q] = [rect.nw, rect.se].map(x => this.applyMatrixVect(matrix, x));
    return rect.copy(Geom.Rect.fromPoints(p, q));
  }

  getColor(color: string) {
    return this.colorCache[color] || (
      this.colorCache[color] = new THREE.Color(color)
    );
  }

  computeTangents(ring: Geom.Vector[]) {
    // We concat `ring[0]` for final tangent
    return ring.concat(ring[0]).reduce(
      (agg, p, i, ps) =>
        i > 0
          ? agg.concat(p.clone().translate(-ps[i - 1].x, -ps[i - 1].y).normalize())
          : [],
        [] as Geom.Vector[],
    );
  }

  createAxis(type: 'x' | 'y', color = '#f00', opacity = 1, lineWidth = 0.008) {
    return this.createPolyLine(
      type === 'x'
        ? [new THREE.Vector3(-50, 0), new THREE.Vector3(50, 0)]
        : [new THREE.Vector3(0, -50), new THREE.Vector3(0, 50)],
        { height: 0, color, opacity, lineWidth },
    );
  }

  createCube(p: THREE.Vector3, dim: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(dim, dim, dim),
      material,
    );
    mesh.position.set(p.x, p.y, p.z);
    return mesh;
  }

  createGroup(objects: THREE.Object3D[], name?: string) {
    const group = new THREE.Group;
    objects.forEach(o => group.add(o));
    name && (group.name = name);
    return group;
  }

  createPath(points: Geom.VectorJson[], name: string) {
    const cubes = points.map(p => this.createCube(
      new THREE.Vector3(p.x, p.y, 0.2), 0.05, this.whiteMaterial));
    const polyLine = this.createPolyLine(points, { height: 0.2 });
    return this.createGroup([...cubes, polyLine], name);
  }

  createPolyLine(points: Geom.VectorJson[], opts: {
    height: number;
    lineWidth?: number;
    color?: string;
    opacity?: number;
  }) {
    if (points.length < 2) {
      new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshBasicMaterial);
    }

    const mesh = new THREE.Mesh;
    const [p, q] = points.slice(points.length - 2);
    const delta = new Geom.Vector(-(q.y - p.y), q.x - p.x).normalize(defaultLineWidth/2);
    const polyPoints = points.map(({ x, y }) => new Geom.Vector(x, y).add(delta))
      .concat(points.map(({ x, y }) => new Geom.Vector(x, y).sub(delta)).reverse());

    mesh.geometry = this.polysToGeometry([new Geom.Polygon(polyPoints)], 'xy', opts.height);
    mesh.material = this.getBasicMat( opts.color || '#ffffff', opts.opacity??1 );
    (mesh.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide;
    return mesh;
  }

  createRegularPolygon(numEdges: number) {
    return Geom.Polygon.from({
      outer: range(numEdges).map((i) => [
        Math.cos((2 * i) * Math.PI / numEdges),
        Math.sin((2 * i) * Math.PI / numEdges),
      ]),
    });
  }

  /** Create a unit square in XY plane whose bottom-left is the origin */
  createSquareGeometry() {
    return this.polysToGeometry([Geom.Polygon.from(
      new Geom.Rect(0, 0, 1, 1),
    )]);
  }

  /**
   * Cut `cuttingPolys` out of `polys`.
   */
  cutOut(cuttingPolys: Geom.Polygon[], polys: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Geom.Polygon.from(coords).cleanFinalReps());
  }

  /** Ensure radian in range (-pi, pi] */
  ensureDeltaRad(radians: number) {
    const modulo = ((radians % twopi) + twopi) % twopi;
    return modulo > Math.PI ? (modulo - twopi) : modulo;
  }

  /** Join disjoint triangulations */
  joinTriangulations(decomps: { vs: Geom.Vector[]; tris: Triple<number>[] }[]) {
    if (decomps.length === 1) return decomps[0];
    const vs = [] as Geom.Vector[];
    const tris = [] as Triple<number>[];
    let offset = 0;
    for (const decomp of decomps) {
      vs.push(...decomp.vs);
      tris.push(...decomp.tris.map(tri => tri.map(x => x += offset) as Triple<number>));
      offset += decomp.vs.length;
    }
    return { vs, tris };
  }

  /**
   * Compute intersection of two infinite lines i.e.
   * `p0 + lambda_0 * d0` and `p1 + lambda_1 * d1`.
   * If intersect return `lambda_0`, else `null`.
   */
  getLinesIntersection(
    p0: Geom.VectorJson,
    d0: Geom.VectorJson,
    p1: Geom.VectorJson,
    d1: Geom.VectorJson,
  ): null | number {
    const d0x = d0.x, d0y = d0.y,
      p0x = p0.x, p0y = p0.y,
      d1x = d1.x, d1y = d1.y,
      p1x = p1.x, p1y = p1.y;
    /**
     * Recall that normal_0 is (-d0y, d0x).
     * No intersection if the directions d0, d1 are approx. parallel,
     * ignoring colinear case.
     */
    if (Math.abs(-d0y * d1x + d0x * d1y) < 0.0001) {
      return null;
    }
    return (d1x * (p1y - p0y) - d1y * (p1x - p0x)) / (d0y * d1x - d1y * d0x);
  }

  getVertices(mesh: THREE.Mesh) {
    const { vertices } = this.toThreeGeometry(mesh.geometry);
    return vertices.map(p => mesh.localToWorld(p));
  }

  isPointInTriangle(pt: Geom.VectorJson, v1: Geom.VectorJson, v2: Geom.VectorJson, v3: Geom.VectorJson) {
    const d1 = this.triangleSign(pt, v1, v2);
    const d2 = this.triangleSign(pt, v2, v3);
    const d3 = this.triangleSign(pt, v3, v1);

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNeg && hasPos);
  }

  /** Assume `poly` is an island and all edges are segments */
  inset(poly: Geom.Polygon, amount: number): Geom.Polygon[] {
    if (amount === 0) {
      return [poly.clone()];
    }

    // Compute 4-gons inset along edge normals by amount
    const [outerQuads, ...holesQuads] = [
      { ring: poly.outer, inset: this.insetRing(poly.outer, amount) },
      ...poly.holes.map(ring => ({ ring, inset: this.insetRing(ring, amount) })),
    ].map(({ ring, inset }) => ring.map((_, i) =>
      new Geom.Polygon([
        ring[i].clone(),
        inset[i],
        inset[(i + 1) % ring.length],
        ring[(i + 1) % ring.length].clone(),
      ])
    ));

    if (amount > 0) {// Inset
      return this.cutOut(outerQuads.concat(...holesQuads), [poly.clone()]);
    } // Outset
    return this.union([poly.clone()].concat(outerQuads, ...holesQuads));
  }

  /** Inset a ring by `amount`. */
  insetRing(ring: Geom.Vector[], amount: number): Geom.Vector[] {
    /** Tangents */
    const ts = this.computeTangents(ring);

    const length = ring.length;
    /** Edges of ring translated along their normal by `amount` */
    const offsetEdges = ring.map<[Geom.Vector, Geom.Vector]>((v, i) => [
      v.clone().translate(amount * -ts[i].y, amount * ts[i].x),
      ring[(i + 1) % length].clone().translate(amount * -ts[i].y, amount * ts[i].x),
    ]);
    
    const outsetEdges = offsetEdges.map((edge, i) => {
      const nextIndex = (i + 1) % length;
      const nextEdge = offsetEdges[nextIndex];
      const lambda = this.getLinesIntersection(
        edge[1],
        ts[i],
        nextEdge[0],
        ts[nextIndex],
      );
      return lambda
        ? edge[1].translate(lambda * ts[i].x, lambda * ts[i].y)
        : Geom.Vector.average([edge[1], nextEdge[0]]); // Fallback
    });

    return outsetEdges;
  }

  intersect([poly, ...rest ]: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping
      .intersection(
        poly.geoJson.coordinates,
        ...rest.map(({ geoJson: { coordinates } }) => coordinates,
      ),
      ).map(coords => Geom.Polygon.from(coords).cleanFinalReps());
  }

  intersectPolysRect(polys: Geom.Polygon[], rect: Geom.Rect) {
    const polyRect = Geom.Polygon.from(rect);
    return polys.filter(poly => poly.rect.intersects(rect))
      .flatMap(poly => geom.intersect([polyRect, poly]));
  }

  /** Cut polygons from rect, or their collective rect bounds. */
  invert(polygons: Geom.Polygon[], rect?: Geom.Rect) {
    const bounds = rect || Geom.Rect.union(polygons.map(x => x.rect));
    return this.cutOut(polygons, [Geom.Polygon.from(bounds)]);
  }

  isVectorJson(p: any): p is Geom.VectorJson {
    return p && (typeof p.x === 'number') && (typeof p.y === 'number');
  }

  isVectorJsonPath(p: any): p is Geom.VectorJson[] {
    return p instanceof Array && p.every(p => this.isVectorJson(p));
  }

  moveToXY(obj: THREE.Object3D, position: Geom.VectorJson) {
    obj.position.set(position.x, position.y, obj.position.z);
  }

  navFromUnnavigable(polys: Geom.Polygon[]) {
    const rects = polys.map(x => x.rect);
    const bounds = Geom.Polygon.from(Geom.Rect.union(rects));
    return geom.cutOut(polys.flatMap(x => x.createOutset(0.03)), [bounds]);
  }

  outset(poly: Geom.Polygon, amount: number) {
    return this.inset(poly, -amount);
  }

  projectBox3XY({ min, max }: THREE.Box3): Geom.Rect {
    return new Geom.Rect(
      Number(min.x.toFixed(2)),
      Number(min.y.toFixed(2)),
      Number((max.x - min.x).toFixed(2)),
      Number((max.y - min.y).toFixed(2)),
    );
  }

  polyContainsPoint(polygon: Geom.Polygon, point: Geom.VectorJson) {
    if (!polygon.rect.contains(point)) {
      return false;
    }
    // Does any triangle in triangulation contain point?
    return polygon.triangulation
      .map(({ outer }) => outer)
      .some(([u, v, w]) => this.isPointInTriangle(point, u, v, w));
  }

  polysToWalls(polys: Geom.Polygon[], height: number): THREE.BufferGeometry {
    const decomps = polys.map(p => p.triangulate());

    const geometry = new Geometry;
    let offset = 0;
    for (const { vs, tris } of decomps) {
      geometry.vertices.push(...vs.map(p => new THREE.Vector3(p.x, p.y, 0)));
      geometry.faces.push(...tris.map(tri => new Face3(tri[0] + offset, tri[1] + offset, tri[2] + offset)));
      offset += vs.length;
    }
    for (const { vs, tris } of decomps) {
      geometry.vertices.push(...vs.map(p => new THREE.Vector3(p.x, p.y, height)));
      geometry.faces.push(...tris.map(tri => new Face3(tri[0] + offset, tri[1] + offset, tri[2] + offset)));
      offset += vs.length;
    }
    /** Difference between lower and upper vertices */
    const delta = offset / 2;
    offset = 0;
    for (const { outer, holes } of polys) {
      for (const cycle of [outer].concat(holes)) {
        const sides = cycle.length;
        geometry.faces.push(...cycle.map((_, i) =>
          new Face3(offset + i % sides, offset + (i + 1) % sides, delta + offset + (i + 1) % sides)));
        geometry.faces.push(...cycle.map((_, i) =>
          new Face3(delta + offset + (i + 1) % sides, delta + offset + i % sides, offset + i % sides)));
        offset += cycle.length;
      }
    }
    const output = geometry.toBufferGeometry();
    output.computeVertexNormals();
    return output;
  }

  polysToGeometry(
    polygons: Geom.Polygon[],
    plane: 'xy' | 'xz' = 'xy',
    height = 0,
  ) {
    const decomps = polygons.map(p => p.triangulate());
    const all = this.joinTriangulations(decomps);
    const geometry = new Geometry;
    if (plane === 'xy') {
      geometry.vertices.push(...all.vs.map(p => new THREE.Vector3(p.x, p.y, height)));
    } else {
      geometry.vertices.push(...all.vs.map(p => new THREE.Vector3(p.x, height, p.y)));
    }
    geometry.faces.push(...all.tris.map(tri => new Face3(tri[0], tri[1], tri[2])));
    const output = geometry.toBufferGeometry();
    geometry.computeVertexNormals();
    return output;
  }

  polysToMesh(polygons: Geom.Polygon[], material: THREE.Material): THREE.Mesh {
    const geometry = this.polysToGeometry(polygons);
    return new THREE.Mesh(geometry, material);
  }

  /**
   * Project onto XY plane, restricting precision.
   */
  projectXY(v: THREE.Vector3): Geom.Vector {
    return new Geom.Vector(v.x, v.y).precision();
  }

  /**
   * Compute base polygon of mesh, falling back to rectangular bounds.
   */
  polyFromMesh(mesh: THREE.Mesh): Geom.Polygon[] {
    const { faces, vertices: vs } = (new Geometry).fromBufferGeometry(mesh.geometry);
    const groundError = 0.01;
    vs.forEach(v => v.applyMatrix4(mesh.matrixWorld));
    const triangles = faces
      .filter(({ a, b ,c }) => [a, b, c].every(id => Math.abs(vs[id].z) < groundError))
      .map(({ a, b, c }) => new Geom.Polygon([a, b, c].map(id => new Geom.Vector(vs[id].x, vs[id].y))))
    return triangles.length
      ? this.union(triangles)
      : [Geom.Polygon.from(this.rectFromMesh(mesh))];
  }

  /** https://schteppe.github.io/p2.js/docs/files/src_collision_AABB.js.html */
  rayAabbIntersect(src: Geom.VectorJson, dir: Geom.VectorJson, rect: Geom.Rect){
    const t1 = (rect.x - src.x) / dir.x;
    const t2 = (rect.e - src.x) / dir.x;
    const t3 = (rect.y - src.y) / dir.y;
    const t4 = (rect.s - src.y) / dir.y;
    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    if (tmax < 0){// line intersects AABB, but whole AABB is behind us
      return -1;
    }
    if (tmin > tmax){// ray doesn't intersect AABB
      return -1;
    }
    return { x: src.x + dir.x * tmax, y: src.y + dir.y * tmax };
  }

  /** Assume `rect` contains `src` */
  rayLeaveAabbIntersect(src: Geom.VectorJson, dir: Geom.VectorJson, rect: Geom.Rect) {
    const t1 = (rect.x - src.x) / dir.x;
    const t2 = (rect.e - src.x) / dir.x;
    const t3 = (rect.y - src.y) / dir.y;
    const t4 = (rect.s - src.y) / dir.y;
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
    return { x: src.x + dir.x * tmax, y: src.y + dir.y * tmax };
  }


  rectFromMesh(mesh: THREE.Mesh): Geom.Rect {
    const { min, max } = this.tempBox.setFromObject(mesh);
    return new Geom.Rect(min.x, min.y, max.x - min.x, max.y - min.y);
  }

  removePathReps(path: Geom.VectorJson[]) {
    let prev: Geom.VectorJson;
    return path.reduce((agg, p) => {
      if (!(prev && (p.x === prev.x) && (p.y === prev.y))) {
        agg.push(prev = p);
      }
      return agg;
    }, [] as typeof path);
  }

  toThreeGeometry(geom: THREE.BufferGeometry) {
    return new Geometry().fromBufferGeometry(geom);
  }

  toVector3(vector: Geom.VectorJson) {
    return new THREE.Vector3(vector.x, vector.y);
  }

  triangleSign(p1: Geom.VectorJson, p2: Geom.VectorJson, p3: Geom.VectorJson) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
  }

  tryParsePoint(p: string)  {
    const parsed = tryParseJson(p);
    if (this.isVectorJson(parsed)) {
      return parsed;
    }
    throw Error(`failed to parse ${p}`)
  }

  tryParsePath(p: string)  {
    const parsed = tryParseJson(p);
    if (this.isVectorJsonPath(parsed)) {
      return parsed;
    }
    throw Error(`failed to parse ${p}`)
  }

  union(polys: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Geom.Polygon.from(coords).cleanFinalReps());
  }

  unionRects(rects: Geom.Rect[]): Geom.Rect {
    return Geom.Rect.union(rects);
  }

}

export const geom = new GeomService;