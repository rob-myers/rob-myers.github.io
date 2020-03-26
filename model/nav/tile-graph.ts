import { Vector2Json } from '@model/vec2.model';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { smallTileDim } from '@model/level/level-params';

const td = smallTileDim / 4;

interface TileNodeOpts extends BaseNodeOpts {
  position: Vector2Json;
}

class TileNode extends BaseNode<TileNodeOpts> {} 

interface TileEdgeOpts extends BaseEdgeOpts<TileNode> {
  neighbourKeys: string[];
}

class TileEdge extends BaseEdge<TileNode, TileEdgeOpts> {}

export class TileGraph extends BaseGraph<TileNode, TileNodeOpts, TileEdge, TileEdgeOpts> {
  
  constructor() {
    super(TileEdge);
  }
}