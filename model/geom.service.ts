import * as THREE from 'three';
import polygonClipping from 'polygon-clipping';

import { Triple } from 'model/generic.model';
import { Geometry, Face3 } from 'model/3d/facade';
import * as Geom from 'model/geom';

const defaultLineWidth = 0.03;

class GeomService {

  private colorCache = {} as Record<string, THREE.Color>;
  private matCache = {} as Record<string, THREE.MeshBasicMaterial>;

  private getBasicMat(color: string, opacity: number) {
    const key = JSON.stringify({ color, opacity });
    const material = this.matCache[key] || (
      this.matCache[key] = new THREE.MeshBasicMaterial({ color: this.getColor(color), opacity })
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
    return poly.mutatePoints(v => this.applyMatrixVect(matrix, v));
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

  computeNavPoly(walls: Geom.Polygon[], obs: Geom.Polygon[], inset: number) {
    const outers = this.union(walls.map(x => new Geom.Polygon(x.outer)));
    return geom.cutOut(
      walls.concat(obs).flatMap(x => x.createOutset(inset)),
      outers.flatMap(x => x.createInset(inset)),
    );
  }

  computeTangents(ring: Geom.Vector[]) {
    // We append `ring[0]` for final tangent
    return ring.concat(ring[0]).reduce(
      (agg, p, i, ps) => i > 0
        ? agg.concat(p.clone().translate(-ps[i - 1].x, -ps[i - 1].y).normalize())
        : [],
      [] as Geom.Vector[],
    );
  }

  createAxis(type: 'x' | 'y', color = '#f00', opacity = 1, lineWidth = defaultLineWidth) {
    return this.createPolyLine(
      type === 'x'
        ? [new THREE.Vector3(-1000, 0), new THREE.Vector3(1000, 0)]
        : [new THREE.Vector3(0, 1000), new THREE.Vector3(0, -1000)],
        { height: 0, color, opacity, lineWidth },
    );
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
    const extent = opts.lineWidth || defaultLineWidth;
    const polygon = this.linesToPoly(points.map(p => Geom.Vector.from(p)), extent);
    const mesh = new THREE.Mesh;
    mesh.geometry = this.polysToGeometry([polygon], 'xy', opts.height);
    const material = this.getBasicMat(opts.color || '#ffffff', opts.opacity??1);
    material.side = THREE.DoubleSide, mesh.material = material;
    return mesh;
  }

  createSpotLight({ x, y }: Geom.VectorJson, height: number) {
    const light = new THREE.SpotLight;
    light.position.set(x, y, height);
    light.target.position.set(x, y, 0);
    light.intensity = 3;
    light.decay = 1.5;
    light.distance = 3;
    // light.angle = Math.PI / 4;
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.autoUpdate = false;
    light.shadow.camera.near = 0.3;
    return light;
  }

  /** Create a unit square in XY plane whose bottom-left is the origin */
  createSquareGeometry() {
    return this.polysToGeometry([
      Geom.Polygon.from(new Geom.Rect(0, 0, 1, 1))
    ]);
  }

  /** Cut `cuttingPolys` out of `polys`. */
  cutOut(cuttingPolys: Geom.Polygon[], polys: Geom.Polygon[], precision?: number): Geom.Polygon[] {
    return polygonClipping
      .difference(
        polys.map(({ geoJson: { coordinates } }) => coordinates),
        ...cuttingPolys.map(({ geoJson: { coordinates } }) => coordinates),
      )
      .map(coords => Geom.Polygon.from(coords))
      .map(poly => (precision ? poly.precision(precision) : poly).cleanFinalReps());
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
      const lambda = this.getLinesIntersection(edge[1], ts[i], nextEdge[0], ts[nextIndex]);
      return lambda
        ? edge[1].translate(lambda * ts[i].x, lambda * ts[i].y)
        : Geom.Vector.average([edge[1], nextEdge[0]]); // Fallback
    });
    return outsetEdges;
  }

  intersect([poly, ...rest ]: Geom.Polygon[]): Geom.Polygon[] {
    return polygonClipping.intersection(
        poly.geoJson.coordinates,
        ...rest.map(({ geoJson: { coordinates } }) => coordinates,
      )).map(coords => Geom.Polygon.from(coords).cleanFinalReps()
    );
  }

  /** Used by code-library.ts */
  intersectPolysRect(polys: Geom.Polygon[], rect: Geom.Rect) {
    const polyRect = Geom.Polygon.from(rect);
    return polys.filter(poly => poly.rect.intersects(rect))
      .flatMap(poly => geom.intersect([polyRect, poly]))
      .map(x => x.precision(1));
  }

  linesToPoly(line: Geom.Vector[], extent: number) {
    const deltas = line.map((p, i) => line[(i + 1) % line.length].clone().sub(p));
    const edgeNs = deltas.map(p => p.rotate90().normalize(extent));
    const vertexNs = line.map((_, i) => {
      if (i === 0) return edgeNs[i];
      if (i === line.length - 1) return edgeNs[i - 1];
      return edgeNs[i].clone().add(edgeNs[i - 1]).normalize(extent);
    });
    const extruded = line.map((p, i) => p.clone().add(vertexNs[i]));
    return new Geom.Polygon(line.concat(extruded.reverse()));
  }

  /** Currently unused */
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

  triangleSign(p1: Geom.VectorJson, p2: Geom.VectorJson, p3: Geom.VectorJson) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x);
  }

  union(polys: Geom.Polygon[], precision?: number): Geom.Polygon[] {
    return polygonClipping
      .union([], ...polys.map(({ geoJson: { coordinates } }) => coordinates))
      .map(coords => Geom.Polygon.from(coords))
      .map(poly => (precision ? poly.precision(precision) : poly).cleanFinalReps());
  }

}

export const geom = new GeomService;