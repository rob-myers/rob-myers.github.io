export interface VNode<P = {}> {
	type: string | ComponentType<P>;
	props: P & { children: ComponentChildren };
  key: Key;
	ref?: Ref<any> | null;

	_children: Array<VNode<any>> | null;
	_parent: VNode | null;
	_depth: number | null;
	_dom: PreactElement | null;
	_nextDom: PreactElement | null | undefined;
	_component: Component | null;
	_hydrating: boolean | null;
	constructor: undefined;
	_original: number;

  $$typeof?: symbol | string;
	preactCompatNormalized?: boolean;
}

export type ComponentType<P = {}> =
  // | ComponentClass<P>
  | FunctionComponent<P>;

export type ComponentChild =
  | VNode<any>
  | object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

export type ComponentChildren =
  | ComponentChild[]
  | ComponentChild;

export interface PreactElement extends HTMLElement {
  _children?: VNode<any> | null;
  /** Event listeners to support event delegation */
  _listeners?: Record<string, (e: Event) => void>;
  // Preact uses this attribute to detect SVG nodes
  ownerSVGElement?: SVGElement | null;
  data?: string | number; // From Text node
}

export interface Component<P = {}, S = {}> extends preact.Component<P, S> {
	constructor: ComponentType<P>;
	state: S;
	base?: PreactElement;

	_dirty: boolean;
	_force?: boolean;
	_globalContext?: any;
	_vnode?: VNode<P> | null;
	/**
	 * Pointer to the parent dom node. This is only needed for top-level Fragment
	 * components or array returns.
	 */
	_parentDom?: PreactElement | null;
	_processingException?: Component<any, any> | null;
	_pendingError?: Component<any, any> | null;
}

export interface FunctionComponent<P = {}> {
  (props: RenderableProps<P>, context?: any): VNode<any> | null;
  displayName?: string;
  defaultProps?: Partial<P>;
}

export type RenderableProps<P, RefType = any> = P &
	Readonly<{
    key?: Key;
    jsx?: boolean;
    children?: ComponentChildren;
    ref?: Ref<RefType>;
  }>;

export type RefObject<T> = { current: T | null };
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | RefCallback<T>;

export type Key = string | number | any;