import Flatten from '@flatten-js/core';
import * as Geom from '@public-reducer/geom.types';

export class GeomService {

  toArc(json: Geom.ArcJson): Flatten.Arc {
    return Flatten.arc(
      Flatten.point(json.pc.x, json.pc.y),
      json.r,
      json.startAngle,
      json.endAngle,
      json.counterClockwise ? Flatten.ArcOrientationType.CCW : Flatten.ArcOrientationType.CW,
    );
  }

  toBox(json: Geom.BoxJson): Flatten.Box {
    return new Flatten.Box(json.xmin, json.ymin, json.xmax, json.ymax);
  }

  toCircle(json: Geom.CircleJson): Flatten.Circle {
    return Flatten.circle(Flatten.point(json.pc.x, json.pc.y), json.r);
  }

  toEdge(json: Geom.EdgeJson): Flatten.Edge {
    return new Flatten.Edge(this.toEdgeShape(json));
  }
  toEdgeShape(json: Geom.EdgeJson) {
    return json.name === 'arc' ? this.toArc(json) : this.toSegment(json);
  }

  toFace(json: Geom.FaceJson): Flatten.Face {
    // Via native json support
    return (new Flatten.Face as any)(json.edges);
  }

  toLine(json: Geom.LineJson): Flatten.Line {
    return Flatten.line(
      Flatten.point(json.pt.x, json.pt.y),
      Flatten.vector(json.norm.x, json.norm.y),
    );
  }

  toMultiline({ edges }: Geom.MultilineJson): Flatten.Multiline {
    return new Flatten.Multiline(
      edges.map(this.toMultilineEdge)
    );
  }

  toMultilineEdge(edge: Geom.MultilineJson['edges'][0]) {
    switch (edge.name) {
      case 'arc': return this.toArc(edge);
      case 'line': return this.toLine(edge);
      case 'ray': return this.toRay(edge);
      case 'segment': return this.toSegment(edge);
    }
  }

  toPoint(json: Geom.PointJson): Flatten.Point {
    return Flatten.point(json.x, json.y);
  }

  toPolygon({ faces }: Geom.PolygonJson): Flatten.Polygon {
    return new Flatten.Polygon(
      faces.map(({ edges }) =>
        edges.map((edge) => this.toEdgeShape(edge))),
    );
  }

  toRay(json: Geom.RayJson): Flatten.Ray {
    return new Flatten.Ray(
      Flatten.point(json.pt.x, json.pt.y),
      Flatten.vector(json.norm.x, json.norm.y),
    );
  }

  toSegment(json: Geom.SegmentJson): Flatten.Segment {
    return Flatten.segment(
      Flatten.point(json.ps.x, json.ps.y),
      Flatten.point(json.pe.x, json.pe.y),
    );
  }

  toVector(json: Geom.VectorJson): Flatten.Vector {
    return Flatten.vector(json.x, json.y);
  }

}