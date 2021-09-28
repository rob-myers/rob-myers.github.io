import { Vect } from "./vect";

export class Ray {

	constructor(origin = new Vect(), direction = new Vect(1, 0)) {
    /** @type {Vect} */
		this.origin = origin;
    /** @type {Vect} */
		this.direction = direction;
    /** @type {Vect} */
		this.normal = new Vect( -direction.y, direction.x );
	}

}