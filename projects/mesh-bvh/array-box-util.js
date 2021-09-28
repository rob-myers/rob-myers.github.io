// /**
//  * 
//  * @param {number} nodeIndex32 
//  * @param {number[]} array 
//  * @param {*} target 
//  */
// export function arrayToBox( nodeIndex32, array, target ) {
// 	target.min.x = array[ nodeIndex32 ];
// 	target.min.y = array[ nodeIndex32 + 1 ];
// 	target.min.z = array[ nodeIndex32 + 2 ];

// 	target.max.x = array[ nodeIndex32 + 3 ];
// 	target.max.y = array[ nodeIndex32 + 4 ];
// 	target.max.z = array[ nodeIndex32 + 5 ];

// 	return target;
// }

/**
 * @param {Float32Array} bounds 
 */
export function getLongestEdgeIndex( bounds ) {
	let splitDimIdx = - 1;
	let splitDist = - Infinity;

	for ( let i = 0; i < 3; i ++ ) {
		const dist = bounds[ i + 3 ] - bounds[ i ];
		if ( dist > splitDist ) {
			splitDist = dist;
			splitDimIdx = i;
		}
	}
	return splitDimIdx;
}

/**
 * Copys bounds a into bounds b
 * @param {Float32Array} source 
 * @param {Float32Array} target 
 */
export function copyBounds( source, target ) {
	target.set( source );
}

/**
 * Sets bounds target to the union of bounds a and b
 * @param {Float32Array} a 
 * @param {Float32Array} b 
 * @param {Float32Array} target 
 */
export function unionBounds( a, b, target ) {
	let aVal, bVal;
	for ( let d = 0; d < 3; d ++ ) {

		const d3 = d + 3;

		// set the minimum values
		aVal = a[ d ];
		bVal = b[ d ];
		target[ d ] = aVal < bVal ? aVal : bVal;

		// set the max values
		aVal = a[ d3 ];
		bVal = b[ d3 ];
		target[ d3 ] = aVal > bVal ? aVal : bVal;

	}
}

/**
 * Compute bounds surface area
 * @param {Float32Array} bounds 
 */
export function computeSurfaceArea( bounds ) {
	const d0 = bounds[ 3 ] - bounds[ 0 ];
	const d1 = bounds[ 4 ] - bounds[ 1 ];
	const d2 = bounds[ 5 ] - bounds[ 2 ];

	return 2 * ( d0 * d1 + d1 * d2 + d2 * d0 );
}