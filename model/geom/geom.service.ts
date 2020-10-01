import * as THREE from "three";
import { Geometry, Vector3, Face3, Mesh } from "three";
import { MeshLineMaterial, MeshLine } from 'three.meshline';
import polygonClipping from 'polygon-clipping';
import rectDecompose from 'rectangle-decomposition';
import maximalMatching from 'bipartite-matching';
import minimalVertexCover from 'bipartite-vertex-cover';
import maximalIndependentSet from 'maximal-independent-set';

import * as Geom from '@model/geom/geom.model';
import { epsilon } from "@model/three/three.model";
import { Triple, tryParseJson } from "@model/generic.model";

const twopi = 2 * Math.PI;

class GeomService {

  private whiteMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  private whiteColor = new THREE.Color('#ffffff');
  private lineMaterial = new MeshLineMaterial( { color: this.whiteColor, lineWidth: 0.02 } );

  /** Multipolygon must be rectilinear with integer-valued coords. */
  private computeIntegerRectPartition({ outline, holes }: Geom.Polygon): Geom.Rect[] {
    const loops = [outline].concat(holes)
      .map((loop) => loop.map(({ x, y }) => [x, y] as [number, number]));

    const rects = rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
      new Geom.Rect(x1, y1, x2 - x1, y2 - y1));

    return rects;
  }

  /** Rationalised poly must be rectilinear. */
  computeRectPartition(poly: Geom.Polygon, decimalPlaces = 3) {
    const scalar = 100;
    const navPoly = poly.clone().scale(scalar).round();
    const navPartition = this.computeIntegerRectPartition(navPoly)
      .map(r => r.scale(1/scalar).precision());
    return navPartition;
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

  createCube(p: Vector3, dim: number, material: THREE.Material) {
    const mesh = new Mesh(
      new THREE.BoxGeometry(dim, dim, dim),
      material,
    );
    mesh.position.set(p.x, p.y, p.z);
    return mesh;
  }

  createPolyLine(points: Geom.VectorJson[], height = 0.5) {
    const meshLine = new MeshLine();
    meshLine.setPoints(points.map(p => new Vector3(p.x, p.y, height)));
    return new THREE.Mesh(meshLine, this.lineMaterial);
  }

  createGroup(objects: THREE.Object3D[], name?: string) {
    const group = new THREE.Group();
    objects.forEach(o => group.add(o));
    name && (group.name = name);
    return group;
  }

  createPath(points: Geom.VectorJson[], name: string) {
    const cubes = points.map(p => this.createCube(
      new Vector3(p.x, p.y, 0.2), 0.05, this.whiteMaterial));
    const polyLine = this.createPolyLine(points, 0.2);
    return this.createGroup([...cubes, polyLine], name);
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

  getMaximalIndependentSet(graph: Geom.BipartiteGraph) {
    return maximalIndependentSet(graph.n, graph.m, graph.edges);
  }

  getMaximalMatching(graph: Geom.BipartiteGraph) {
    return maximalMatching(graph.n, graph.m, graph.edges);
  }

  getMinimalVertexCover(graph: Geom.BipartiteGraph) {
    return minimalVertexCover(graph.n, graph.m, graph.edges);
  }

  /** Assume `poly` is an island and all edges are segments */
  inset(poly: Geom.Polygon, amount: number): Geom.Polygon[] {
    if (amount === 0) {
      return [poly.clone()];
    }

    // Compute 4-gons inset along edge normals by amount
    const [outerQuads, ...holesQuads] = [
      { ring: poly.outline, inset: this.insetRing(poly.outline, amount) },
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

  isVectorJson(p: any): p is Geom.VectorJson {
    return p && (typeof p.x === 'number') && (typeof p.y === 'number');
  }

  isVectorJsonPath(p: any): p is Geom.VectorJson[] {
    return p instanceof Array && p.every(p => this.isVectorJson(p));
  }

  moveToXY(obj: THREE.Object3D, position: Geom.VectorJson) {
    obj.position.set(position.x, position.y, obj.position.z);
  }

  projectBox3XY({ min, max }: THREE.Box3): Geom.Rect {
    return new Geom.Rect(
      Number(min.x.toFixed(2)),
      Number(min.y.toFixed(2)),
      Number((max.x - min.x).toFixed(2)),
      Number((max.y - min.y).toFixed(2)),
    );
  }

  navPolysToMesh(navPolys: Geom.Polygon[]): THREE.Mesh {
    const decomps = navPolys.map(p => p.qualityTriangulate());
    const all = this.joinTriangulations(decomps);

    const geometry = new Geometry();
    geometry.vertices.push(...all.vs.map(p => new Vector3(p.x, 0, p.y)));
    geometry.faces.push(...all.tris.map(tri => new Face3(tri[2], tri[1], tri[0])));

    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    return new Mesh(
      (new THREE.BufferGeometry()).fromGeometry(geometry),
      new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    );
  }

  /**
   * Project onto XY plane, restricting precision.
   */
  projectXY(v: THREE.Vector3): Geom.Vector {
    return new Geom.Vector(v.x, v.y).precision();
  }

  /**
   * Project base of three.js geometry onto XY plane, restricting precision.
   * May have disjoint pieces, so outputs a list of (multi)polygons.
   */
  projectGeometryXY(parent: THREE.Mesh, geometry: THREE.Geometry): Geom.Polygon[] {
    const baseTris = [] as Geom.Polygon[];
    const vs = geometry.vertices.map(p => parent.localToWorld(p.clone()));
    geometry.faces.forEach(({ a, b, c }) => {
      const tri = [a, b, c].map(i => vs[i]);
      if (tri.every(p => Math.abs(p.z) < epsilon)) {
        baseTris.push(new Geom.Polygon(tri.map(this.projectXY)));
      }
    });
    // console.log({ key: parent.name, baseTris });
    return this.union(baseTris);
  }

  outset(poly: Geom.Polygon, amount: number) {
    return this.inset(poly, -amount);
  }

  randomBipartiteGraph(n: number, m: number, p: number) {
    return {
        n,
        m,
        edges: [...Array(n)].reduce((agg, _, i) =>
          agg.concat(...[...Array(m)].map((_, j) => Math.random() < p ? [[i, j]] : []))
        , [] as Geom.BipartiteEdge[]),
    };
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
    return (new THREE.Geometry()).fromBufferGeometry(geom);
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

}

export const geomService = new GeomService;
