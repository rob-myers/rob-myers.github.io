import { useEffect, useRef, useState } from "react";
import cytoscape from 'cytoscape';
import type { VectorJson } from "@model/geom/geom.model";
import { defaults } from './util';

const Cytoscape: React.FC<Partial<Props>> = (props) => {
  const el = useRef<HTMLDivElement>(null);
  const cy = useRef<cytoscape.Core>();

  useEffect(() => {
    const container = el.current!;
    cy.current = cytoscape({
      container,
      elements: props.elements,
      style: props.stylesheet,

      styleEnabled: props.styleEnabled,
      hideEdgesOnViewport: props.hideEdgesOnViewport,
      textureOnViewport: props.textureOnViewport,
      motionBlur: props.motionBlur,
      motionBlurOpacity: props.motionBlurOpacity,
      wheelSensitivity: props.wheelSensitivity,
      pixelRatio: props.pixelRatio,
    });

    const resize = () => setTimeout(() => cy.current!.animate({
      center: { eles: cy.current as any },
      fit: { eles: cy.current as any, padding: 10 },
      duration: 200,
    }), 200);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cy.current?.destroy();
    };
  }, []);

  /**
   * TODO handle prop changes
   */

  return <div ref={el} style={props.style} />
};

Cytoscape.defaultProps = defaults;

export interface Props {
  /**
   * The `id` HTML attribute of the component.
   * */
  id: string;

  /**
   * The `class` HTML attribute of the component.  Use this to set the dimensions of
   * the graph visualisation via a style block in your CSS file.
   */
  className: string,

  /**
   * The `style` HTML attribute of the component.  Use this to set the dimensions of
   * the graph visualisation if you do not use separate CSS files.
   */
  style: React.CSSProperties;

  /**
   * The flat list of Cytoscape elements to be included in the graph, each represented
   * as non-stringified JSON.  E.g.:
   *
   * ```
   * elements: [
   *   { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
   *   { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
   *   { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
   * ]
   * ```
   *
   * See http://js.cytoscape.org/#notation/elements-json
   * */
  elements: {
    data: { id?: string; label?: string; source?: string; target?: string };
    position?: VectorJson;
  }[];

  /**
   * The Cytoscape stylesheet as non-stringified JSON.  E.g.:
   *
   * ```
   * stylesheet: [
   *   {
   *      selector: 'node',
   *      style: {
   *        'width': 30,
   *        'height': 30,
   *        'shape': 'rectangle'
   *      }
   *   }
   * ]
   * ```
   *
   * See http://js.cytoscape.org/#style
   */
  stylesheet: cytoscape.Stylesheet[];

  /**
   * Use a layout to automatically position the nodes in the graph.  E.g.
   *
   * ```
   * layout: { name: 'random' }
   * ```
   *
   * N.b. to use an external layout extension, you must register the extension
   * prior to rendering this component, e.g.:
   *
   * ```
   * import Cytoscape from 'cytoscape';
   * import COSEBilkent from 'cytoscape-cose-bilkent';
   * import React from 'react';
   * import CytoscapeComponent from 'cytoscape-reactjs';
   *
   * Cytoscape.use(COSEBilkent);
   *
   * class MyApp extends React.Component {
   *   render() {
   *     const elements = [
   *       { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
   *       { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
   *       { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
   *     ];
   *
   *     const layout = { name: 'cose-bilkent' };
   *
   *     return <CytoscapeComponent elements={elements} layout={layout}>;
   *   }
   * }
   * ```
   *
   * See http://js.cytoscape.org/#layouts
   */
  layout: { name: 'random' | string };

  /**
   * The panning position of the graph.
   *
   * See http://js.cytoscape.org/#init-opts/pan
   */
  pan: VectorJson;

  /**
   * The zoom level of the graph.
   *
   * See http://js.cytoscape.org/#init-opts/zoom
   */
  zoom: number;

  /**
   * Whether the panning position of the graph is mutable overall.
   *
   * See http://js.cytoscape.org/#init-opts/panningEnabled
   */
  panningEnabled: boolean;

  /**
   * Whether the panning position of the graph is mutable by user gestures (e.g. swipe).
   *
   * See http://js.cytoscape.org/#init-opts/userPanningEnabled
   */
  userPanningEnabled: boolean;

  /**
   * The minimum zoom level of the graph.
   *
   * See http://js.cytoscape.org/#init-opts/minZoom
   */
  minZoom: number;

  /**
   * The maximum zoom level of the graph.
   *
   * See http://js.cytoscape.org/#init-opts/maxZoom
   */
  maxZoom: number;

  /**
   * Whether the zoom level of the graph is mutable overall.
   *
   * See http://js.cytoscape.org/#init-opts/zoomingEnabled
   */
  zoomingEnabled: boolean;

  /**
   * Whether the zoom level of the graph is mutable by user gestures (e.g. pinch-to-zoom).
   *
   * See http://js.cytoscape.org/#init-opts/userZoomingEnabled
   */
  userZoomingEnabled: boolean;

  /**
   * Whether shift+click-and-drag box selection is enabled.
   *
   * See http://js.cytoscape.org/#init-opts/boxSelectionEnabled
   */
  boxSelectionEnabled: boolean;

  /**
   * If true, nodes automatically can not be grabbed regardless of whether
   * each node is marked as grabbable.
   *
   * See http://js.cytoscape.org/#init-opts/autoungrabify
   */
  autoungrabify: boolean;

  /**
   * If true, nodes can not be moved at all.
   *
   * See http://js.cytoscape.org/#init-opts/autolock
   */
  autolock: boolean;

  /**
   * If true, elements have immutable selection state.
   *
   * See http://js.cytoscape.org/#init-opts/autounselectify
   */
  autounselectify: boolean;

  /**
   * `get(object, key)`
   * Get the value of the specified `object` at the `key`, which may be an integer
   * in the case of lists/arrays or strings in the case of maps/objects.
   */
  get: <T extends number | string>(object: any, key: string) => T;

  /**
   * `toJson(object)`
   * Get the deep value of the specified `object` as non-stringified JSON.
   */
  toJson: (obj: any) => any;

  /**
   * diff(objectA, objectB)
   * Return whether the two objects have equal value. This is used to determine if
   * and where Cytoscape needs to be patched.
   */
  diff: (objA: any, objB: any) => boolean;

  /**
   * forEach(list, iterator)
   * Call `iterator` on each element in the `list`, in order.
   */
  forEach: <T = any>(list: T[], iterator: (item: T) => void) => void;

  /**
   * cy(cyRef)
   * The `cy` prop allows for getting a reference to the `cy` Cytoscape object, e.g.:
   *
   * `<CytoscapeComponent cy={cy => (myCyRef = cy)} />`
   */
  cy: cytoscape.Core;

  /**
   * headless
   * The `headless` proper allows for setting whether the Cytoscape instance is headless, i.e.
   * not rendered.  This value can not be changed after initialisation of the component.
   */
  headless: boolean;

  /**
   * styleEnabled
   * The `styleEnabled` flag is used to enable style functionality in a headless instance (i.e.
   * `headless: true, styleEnabled: true`).  For a rendered instance, do not set this value.
   */
  styleEnabled: boolean;

  /**
   * hideEdgesOnViewport
   * A rendering hint that specifies, for renderers which support the hint, whether edges should
   * be hidden during zoom and pan operations.
   */
  hideEdgesOnViewport: boolean;

  /**
   * textureOnViewport
   * A rendering hint that specifies, for renderers which support the hint, whether a preview
   * based on the existing scene should be used in place of building a new scene.
   */
  textureOnViewport: boolean;

  /**
   * motionBlur
   * A rendering hint that specifies, for renderers which support the hint, whether a motion blur
   * effect should be applied.
   */
  motionBlur: boolean;

  /**
   * motionBlurOpacity
   * A rendering hint that specifies, for renderers which support the hint, how strong the motion
   * blur effect should be.  The value ranges from 0 to 1, with larger values indicating larger
   * strength.
   */
  motionBlurOpacity: number;

  /**
   * wheelSensitivity
   * A rendering hint that specifies, for renderers which support the hint, how fast wheel zooming
   * should be.  The value is a positive multiplier.  Do not set this value unless you are using
   * unconventional hardware and can guarantee that all your users will use the same hardware.  The
   * default value works well for standard mice on common operating systems.  If you change this
   * value, it is very likely that you will create a bad user experience for many or most of your
   * users.
   */
  wheelSensitivity: number;

  /**
   * pixelRatio
   * A rendering hint that specifies, for renderers which support the hint, the pixel ratio that
   * should be used.  May be 'auto' or a positive number.
   */
  pixelRatio: 'auto' | number;
}


export default Cytoscape;
