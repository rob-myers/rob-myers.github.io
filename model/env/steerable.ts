import * as THREE from 'three';
import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';

/**
 * https://github.com/erosmarcon/three-steer/blob/master/js/ThreeSteer.js
 */
class BaseSteerable {

  mass = 1;
  maxSpeed = 0.02;
  velocity: THREE.Vector3 & { angle: number };
  box = new THREE.Box3;
  velocitySamples = [] as THREE.Vector3[];
  numSamplesForSmoothing = 20;

  lookStrategy = LookStrategy.travel;
  /** Target look direction when controlled */
  private lookQuaternion = new THREE.Quaternion;

  constructor(public group: THREE.Group) {
    this.velocity = Object.defineProperty(new THREE.Vector3, 'angle', {
      get: function() {
        return Math.atan2(this.y, this.x);
      },
      set: function(value) {
        this.x = Math.cos(value) * this.length();
        this.y = Math.sin(value) * this.length();
      },
    });
  }

  get position() {
    return this.group.position;
  }

  get positionXY(): Geom.VectorJson {
    return { x: this.group.position.x, y: this.group.position.y };
  }

  get backward() {
    return this.forward.clone().negate();
  }

  get depth() {
    return this.box.max.y - this.box.min.y;
  }

  /** Our convention: +y goes into screen */
  get forward() {
    return new THREE.Vector3(-1, 0, 0)
      .applyQuaternion(this.group.quaternion).negate();
  }
  
  /** Our convention: +z goes up */
  get height() {
    return this.box.max.z - this.box.min.z;
  }

  get left() {
    return this.forward.clone()
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * .5)
  }

  look() {
    switch (this.lookStrategy) {
      case LookStrategy.travel:
        this.lookWhereGoing(true);
      case LookStrategy.controlled:
      case LookStrategy.static:
        return;
    }
  }

  lookTowards(ratio: number) {
    this.group.quaternion.slerp(this.lookQuaternion, ratio);
  }

  /** Look along direction of travel using velocity samples */
  lookWhereGoing(smoothing: boolean) {
    let target = this.position.clone()
      .add(this.velocity)
      .setZ(this.position.z);

    if (smoothing) {
      if (this.velocitySamples.length == this.numSamplesForSmoothing) {
        this.velocitySamples.shift();
      }

      this.velocitySamples.push(this.velocity.clone().setZ(0));
      target.set(0, 0, 0);
      for (var v = 0; v < this.velocitySamples.length; v++) {
        target.add(this.velocitySamples[v])
      }
      target.divideScalar(this.velocitySamples.length)
      target = this.position.clone().add(target).setZ(0);
    }

    this.group.rotation.z = Math.atan2(
      target.y - this.position.y,
      target.x - this.position.x,
    );
  }

  get right() {
    return this.left.clone().negate();
  }

  /**
   * Must be set explicitly.
   */
  setBounds(bounds: THREE.Box3) {
    this.box.copy(bounds);
  }

  /** Returns total delta angle */
  setLookTarget(target: THREE.Vector3) {
    const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
    this.lookQuaternion.setFromEuler(new THREE.Euler( 0, 0, angle ));
    return geomService.ensureDeltaRad(angle - this.group.rotation.z);
  }

  update() {
    this.velocity.clampLength(0, this.maxSpeed);
    this.velocity.setZ(0);
    this.position.add(this.velocity);
  }

  get width() {
    return this.box.max.x - this.box.min.x;
  }

}

/**
 * Can look in:
 * - controlled direction i.e. `controlled`
 * - constant direction i.e. `static`
 * - direction of travel i..e `travel`
 */
export enum LookStrategy {
  controlled,
  static,
  travel,
}

/**
 * https://github.com/erosmarcon/three-steer/blob/master/js/ThreeSteer.js
 */
export class Steerable extends BaseSteerable {

  maxForce = 0.1;
  arrivalThreshold = 0.1;
  pathIndex = 0;
  steeringForce = new THREE.Vector3(0, 0, 0);

  seek(position: THREE.Vector3) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
    this.steeringForce.add(desiredVelocity);
  }

  arrive(position: THREE.Vector3) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize()
    var distance = this.position.distanceTo(position)
    if (distance > this.arrivalThreshold)
        desiredVelocity.setLength(this.maxSpeed);
    else
        desiredVelocity.setLength(this.maxSpeed * distance / this.arrivalThreshold)
    desiredVelocity.sub(this.velocity);
    this.steeringForce.add(desiredVelocity);
  }

  followPath(path: THREE.Vector3[], loop: boolean, thresholdRadius = 1) {
    const wayPoint = path[this.pathIndex]
    if (!wayPoint) {
      return true;
    }
    if (this.position.distanceTo(wayPoint) < thresholdRadius) {
      if (this.pathIndex < path.length - 1) {
        this.pathIndex++
      } else if (loop) {
        this.pathIndex = 0;
      } else {
        return true;
      }
    }
    if (this.pathIndex >= path.length - 1 && !loop)
      this.arrive(wayPoint)
    else
      this.seek(wayPoint)
  }

  update() {
    this.steeringForce.clampLength(0, this.maxForce);
    this.steeringForce.divideScalar(this.mass);
    this.velocity.add(this.steeringForce);
    this.steeringForce.set(0, 0, 0);
    super.update();
  }

}

export const placeholderSteerable = new Steerable(new THREE.Group);
