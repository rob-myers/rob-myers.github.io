import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { Rect2Json } from '@model/rect2.model';

/** Width and height is `td` */
interface NavRectNodeOpts extends BaseNodeOpts {
  /** `${Rect2.from(rect)}` */
  id: string;
  rect: Rect2Json;
}

class NavRectNode extends BaseNode<NavRectNodeOpts> {} 

interface NavRectEdgeOpts extends BaseEdgeOpts<NavRectNode> {
  neighbourKeys: string[];
}

class NavRectEdge extends BaseEdge<NavRectNode, NavRectEdgeOpts> {}

export class NavRectGraph extends BaseGraph<NavRectNode, NavRectNodeOpts, NavRectEdge, NavRectEdgeOpts> {
  
  constructor() {
    super(NavRectEdge);
  }

}