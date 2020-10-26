import ELK, { LayoutOptions as ElkOpts, ElkNode } from 'elkjs';

const elk = new ELK;

const layoutOptions: Record<string, string | boolean | number> = {
  'algorithm': 'layered',
  // 'algorithm': 'mrtree', 
  'edgeRouting': 'POLYLINE',
  'elk.direction': 'UP',
  'spacing.nodeNode': 50,
  'layered.considerModelOrder': 'NODES_AND_EDGES',
  // 'algorithm': 'stress', 
  // 'algorithm': 'rectpacking', 
  // 'algorithm': 'force', 
};

//#region debug
// import cytoscape from 'cytoscape';
// import { Worker } from 'elkjs/lib/elk-worker.js';
// let elk: ELK;
// export async function loadElkLayout() {
//   const { default: ELK } = await import('elkjs/lib/elk.bundled.js')
//   // const { default: ELK } = await import('elkjs/lib/elk-api')
//   elk = new ELK({
//     workerUrl: 'elkjs/lib/elk-worker.js',
//     workerFactory: (url) => new Worker(url),
//   });
//   cytoscape('layout', 'elk', ElkCytoscape);
// }
//#endregion

type Options = Partial<cytoscape.CoseLayoutOptions>
  & cytoscape.LayoutDimensionOptions
  & cytoscape.LayoutPositionOptions
  & {
    elk: ElkOpts;
    /** Edges with non-null value are skipped when greedy edge cycle breaking is enabled */
    priority?: (edge: cytoscape.EdgeSingular) => null | true,
  }

type NodeData = ElkNode & { _cyEle?: any };
type EdgeData = ReturnType<ElkCytoscape['makeEdge']>;

/**
 * Based on https://github.com/cytoscape/cytoscape.js-elk/blob/master/src/layout.js
 */
export class ElkCytoscape {

  constructor(public options: Options = {} as any) {
    this.options = { ...getDefaultOpts(), ...options };
  }

  async run() {
    const eles = this.options.eles;
    const [nodes, edges] = [eles.nodes(), eles.edges()];
    const graph = this.makeGraph(nodes, edges);

    // NOTE webworker would fail on HTMLElements _cyEle
    // const els = {} as Record<string, HTMLElement>;
    // graph.children!.concat(graph.edges!)
    //   .forEach((node: NodeData) => {
    //     els[node.id] = node._cyEle;
    //     delete node._cyEle;
    //   });
    
    // `graph` will be mutated
    await elk.layout(graph, {
      layoutOptions: { ...this.options.elk },
    });
    // console.log({ graph });

    (nodes.filter((node) => !node.isParent()) as cytoscape.CollectionReturnValue & cytoscape.NodeCollectionLayout
    ).layoutPositions(this as any, this.options, this.getPos);
  
    return this;
  }

  private makeGraph(
    nodes: cytoscape.NodeCollection,
    edges: cytoscape.EdgeCollection,
  ) {
    const elkNodes = [] as NodeData[];
    const elkEdges = [] as EdgeData[];
    const elkEleLookup = {} as Record<string, NodeData | EdgeData>;
    const graph: ElkNode = {
      id: 'root',
      children: [] as NodeData[],
      edges: [] as EdgeData[],
      layoutOptions: layoutOptions as any,
    };
  
    for( let i = 0; i < nodes.length; i++ ){
      const n = nodes[i];
      const k = this.makeNode(n as any);
      elkNodes.push(k);
      elkEleLookup[ n.id() ] = k;
    }
  
    for( let i = 0; i < edges.length; i++ ){
      const e = edges[i];
      const k = this.makeEdge(e);
      elkEdges.push( k );
      elkEleLookup[ e.id() ] = k;
    }
  
    // make hierarchy
    for( let i = 0; i < elkNodes.length; i++ ){
      let k = elkNodes[i];
      let n = k._cyEle;
  
      if(!n.isChild()){
        graph.children!.push(k);
      } else {
        const parent = n.parent() as cytoscape.NodeCollection & cytoscape.SingularData;
        const parentK = elkEleLookup[parent.id()] as NodeData;
        const children = parentK.children = parentK.children || [];
  
        children.push( k );
      }
    }
  
    for( let i = 0; i < elkEdges.length; i++ ){
      let k = elkEdges[i];
  
      // put all edges in the top level for now
      // TODO does this cause issues in certain edgecases?
      /*let e = k._cyEle;
      let parentSrc = e.source().parent();
      let parentTgt = e.target().parent();
      if ( false && parentSrc.nonempty() && parentTgt.nonempty() && parentSrc.same( parentTgt ) ){
        let kp = elkEleLookup[ parentSrc.id() ];
        kp.edges = kp.edges || [];
        kp.edges.push( k );
      } else {*/
      graph.edges!.push(k);
      //}
    }
  
    return graph;
  };

  private makeNode(node: cytoscape.NodeSingular & cytoscape.NodeSingularLayout) {
    const dims = node.layoutDimensions(this.options) as {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    const padding = node.numericStyle('padding');
  
    const data = {
      _cyEle: node,
      id: node.id(),
      ports: node.data().ports,
      properties: node.data().properties,
      padding: {
        top: padding,
        left: padding,
        bottom: padding,
        right: padding
      },
      width: undefined as undefined | number,
      height: undefined as undefined | number,
      children: [] as ElkNode[],
    };
  
    if(!node.isParent()){
      data.width = dims.w;
      data.height = dims.h;
    }
  
    node.scratch('elk', data);
    return data;
  }
  
  private makeEdge(edge: cytoscape.EdgeSingular){
    const data = {
      _cyEle: edge,
      id: edge.id(),
      source: edge.data('source'),
      target: edge.data('target'),
      priority: null as null | true,
    };
  
    const priority = this.options.priority?.( edge ) || null;
    if( priority !== null ){
      data.priority = priority;
    }
  
    edge.scratch('elk', data);
    return data;
  }

  private getPos(ele: cytoscape.NodeSingular){
    let parent = ele.parent();
    let k = ele.scratch('elk');
    let p = {
      x: k.x,
      y: k.y
    };

    if (parent.nonempty()){
      let kp = (parent as cytoscape.NodeSingular).scratch('elk');
      p.x += kp.x;
      p.y += kp.y;
    }

    return p;
  };


  stop(){
    return this; // chaining
  }
 
  destroy(){
    return this; // chaining
  }
}

function getDefaultOpts(): Options {
  return {
    // Boolean which changes whether label dimensions are included when calculating node dimensions
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 20,
    animate: false, // Whether to transition the node positions
    // animateFilter: function( ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // Duration of animation in ms if enabled
    animationEasing: undefined, // Easing of animation if enabled
    // transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    elk: {},
    // priority: function(){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
    eles: undefined as any,
  };
}
