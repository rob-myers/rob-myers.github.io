import * as Preact from './preact-types';

let vnodeId = 0;

/**
 * Based on https://github.com/preactjs/preact/blob/master/src/create-element.js
 * @param {Preact.VNode["type"]} type 
 * @param {Record<string, any> | null | undefined} [props] 
 * @param {Preact.ComponentChildren} [children] 
 * @returns {Preact.VNode}
 */
export function createElement(type, props, children) {
	let normalizedProps = /** @type {Record<string, any>} */ ({}),
		key, ref, i;

	if (props) {
		for (i in props) {
			if (i == 'key') key = props[i];
			else if (i == 'ref') ref = props[i];
			else normalizedProps[i] = props[i];
		}
	}

	if (arguments.length > 2) {
		normalizedProps.children = arguments.length > 3
      ? [].slice.call(arguments, 2)
      : children;
	}

	if (typeof type == 'function' && type.defaultProps != null) {
		for (i in type.defaultProps) {
			if (normalizedProps[i] === undefined) {
				normalizedProps[i] = type.defaultProps[i];
			}
		}
	}

  return {
		type,
		props: normalizedProps,
		key,
		ref,
		_children: null,
		_parent: null,
		_depth: 0,
		_dom: null,
		_nextDom: undefined,
		_component: null,
		_hydrating: null,
		constructor: undefined,
		_original: ++vnodeId,
	};
}