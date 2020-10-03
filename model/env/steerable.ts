import * as THREE from 'three';
import { Vector3 } from 'three';

/**
 * https://github.com/erosmarcon/three-steer/blob/master/js/ThreeSteer.js
 */
class BaseSteerable {

  mass = 1;
  maxSpeed = 0.1;
  velocity: THREE.Vector3 & { angle: number };
  box = new THREE.Box3;
  raycaster = new THREE.Raycaster;
  velocitySamples = [] as THREE.Vector3[];
  numSamplesForSmoothing = 20;
  radius = 200; // temp initial value

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

  get backward() {
    return this.forward.clone().negate();
  }
  
  bounce(box: THREE.Box3) {
    if (this.position.x > box.max.x) {
      this.position.setX(box.max.x);
      this.velocity.angle = this.velocity.angle + .1
    }

    if (this.position.x < box.min.x) {
      this.position.setX(box.min.x);
      this.velocity.angle = this.velocity.angle + .1
    }

    if (this.position.z > box.max.z) {
      this.position.setZ(box.max.z);
      this.velocity.angle = this.velocity.angle + .1
    }
    if (this.position.z < box.min.z) {
      this.position.setZ(box.min.z);
      this.velocity.angle = this.velocity.angle + .1
    }

    if (this.position.y > box.max.y) {
      this.position.setY(box.max.y);
    }

    if (this.position.y < box.min.y) {
      this.position.setY(-box.min.y);
    }
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

  get right() {
    return this.left.clone().negate();
  }

  /**
   * Must be set explicitly.
   */
  setBounds(bounds: THREE.Box3) {
    this.box.copy(bounds);
  }

  update() {
    this.velocity.clampLength(0, this.maxSpeed);
    this.velocity.setZ(0);
    this.position.add(this.velocity);
  }

  get width() {
    return this.box.max.x - this.box.min.x;
  }

  wrap(box: THREE.Box3) {
      if (this.position.x > box.max.x) {
        this.position.setX(box.min.x + 1);
      }

      else if (this.position.x < box.min.x) {
        this.position.setX(box.max.x - 1);
      }

      if (this.position.z > box.max.z) {
        this.position.setZ(box.min.z + 1);
      }
      else if (this.position.z < box.min.z) {
        this.position.setZ(box.max.z - 1);
      }

      if (this.position.y > box.max.y) {
        this.position.setY(box.min.y + 1);
      }

      else if (this.position.y < box.min.y) {
        this.position.setY(box.max.y + 1);
      }
  }

  lookWhereGoing(smoothing: boolean) {
    let target = this.position.clone()
      .add(this.velocity).setZ(this.position.z);
    
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

    this.group.rotation.z = Math.atan2(target.y - this.position.y, target.x - this.position.x);
  }
}

/**
 * https://github.com/erosmarcon/three-steer/blob/master/js/ThreeSteer.js
 */
export class Steerable extends BaseSteerable {

  maxForce = 0.1;
  arrivalThreshold = 0.1;

  wanderAngle = 0;
  wanderDistance = 10;
  wanderRadius = 5;
  wanderRange = 1;

  avoidDistance = 400;
  avoidBuffer = 20; //NOT USED

  inSightDistance = 200;
  tooCloseDistance = 60;

  pathIndex = 0;

  steeringForce = new THREE.Vector3(0, 0, 0);

  seek(position: THREE.Vector3) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
    this.steeringForce.add(desiredVelocity);
  }

  flee(position: THREE.Vector3) {
    var desiredVelocity = position.clone().sub(this.position);
    desiredVelocity.normalize().setLength(this.maxSpeed).sub(this.velocity);
    this.steeringForce.sub(desiredVelocity);
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

  pursue(target: BaseSteerable) {
    var lookAheadTime = this.position.distanceTo(target.position) / this.maxSpeed;
    var predictedTarget = target.position.clone().add(target.velocity.clone().setLength(lookAheadTime));
    this.seek(predictedTarget);
  }

  evade(target: BaseSteerable) {
    var lookAheadTime = this.position.distanceTo(target.position) / this.maxSpeed;
    var predictedTarget = target.position.clone().sub(target.velocity.clone().setLength(lookAheadTime));
    this.flee(predictedTarget);
  }

  idle() {
    this.velocity.setLength(0);
    this.steeringForce.set(0, 0, 0);
  }

  wander() {
    var center = this.velocity.clone().normalize().setLength(this.wanderDistance);
    var offset = new THREE.Vector3(1, 1, 1);
    offset.setLength(this.wanderRadius);
    offset.x = Math.sin(this.wanderAngle) * offset.length()
    // offset.z = Math.cos(this.wanderAngle) * offset.length()
    offset.y = Math.cos(this.wanderAngle) * offset.length()

    this.wanderAngle += Math.random() * this.wanderRange - this.wanderRange * .5;
    center.add(offset)
    center.setY(0)
    this.steeringForce.add(center);
  }

  interpose(targetA: BaseSteerable, targetB: BaseSteerable) {
    var midPoint = targetA.position.clone().add(targetB.position.clone()).divideScalar(2);
    var timeToMidPoint = this.position.distanceTo(midPoint) / this.maxSpeed;
    var pointA = targetA.position.clone().add(targetA.velocity.clone().multiplyScalar(timeToMidPoint))
    var pointB = targetB.position.clone().add(targetB.velocity.clone().multiplyScalar(timeToMidPoint))
    midPoint = pointA.add(pointB).divideScalar(2);
    this.seek(midPoint)
  }
  
  separation(entities: BaseSteerable[], separationRadius = 300, maxSeparation = 100) {
    var force = new THREE.Vector3(0, 0, 0);
    var neighborCount = 0

    for (var i = 0; i < entities.length; i++) {
      if (entities[i] != this && entities[i].position.distanceTo(this.position) <= separationRadius) {
        force.add(entities[i].position.clone().sub(this.position));
        neighborCount++;
      }
    }
    if (neighborCount != 0) {
      force.divideScalar(neighborCount)
      force.negate();
    }
    force.normalize();
    force.multiplyScalar(maxSeparation);
    this.steeringForce.add(force);
  }

  isOnLeaderSight(
    leader: BaseSteerable,
    ahead: THREE.Vector3,
    leaderSightRadius: number,
  ) {
    return ahead.distanceTo(this.position) <= leaderSightRadius ||
      leader.position.distanceTo(this.position) <= leaderSightRadius;
  }

  followLeader(
    leader: BaseSteerable,
    entities: BaseSteerable[],
    distance = 400,
    separationRadius = 300,
    maxSeparation = 100,
    leaderSightRadius = 1600,
    arrivalThreshold = 200,
  ) {
    var tv = leader.velocity.clone();
    tv.normalize().multiplyScalar(distance)
    var ahead = leader.position.clone().add(tv)
    tv.negate()
    var behind = leader.position.clone().add(tv)

    if (this.isOnLeaderSight(leader, ahead, leaderSightRadius)) {
      this.evade(leader);
    }
    this.arrivalThreshold = arrivalThreshold;
    this.arrive(behind);
    this.separation(entities, separationRadius, maxSeparation);
  }

  getNeighborAhead(entities: BaseSteerable[]) {
    var maxQueueAhead = 500;
    var maxQueueRadius = 500;
    var res;
    var qa = this.velocity.clone().normalize().multiplyScalar(maxQueueAhead);
    var ahead = this.position.clone().add(qa);

    for (var i = 0; i < entities.length; i++) {
      var distance = ahead.distanceTo(entities[i].position);
      if (entities[i] != this && distance <= maxQueueRadius) {
          res = entities[i]
          break;
      }
    }
    return res;
  }

  queue(entities: BaseSteerable[], maxQueueRadius = 500) {
    var neighbor = this.getNeighborAhead(entities);
    var brake = new THREE.Vector3(0, 0, 0)
    var v = this.velocity.clone()
    if (neighbor != null) {
      brake = this.steeringForce.clone().negate().multiplyScalar(0.8);
      v.negate().normalize();
      brake.add(v)
      if (this.position.distanceTo(neighbor.position) <= maxQueueRadius) {
          this.velocity.multiplyScalar(0.3)
      }
    }

    this.steeringForce.add(brake);
  }

  inSight(entity: BaseSteerable) {
    if (this.position.distanceTo(entity.position) > this.inSightDistance)
      return false;
    var heading = this.velocity.clone().normalize();
    var difference = entity.position.clone().sub(this.position);
    var dot = difference.dot(heading)
    if (dot < 0)
      return false;
    return true;
  }

  flock(entities: BaseSteerable[]) {
    var averageVelocity = this.velocity.clone();
    var averagePosition = new THREE.Vector3(0, 0, 0);
    var inSightCount = 0;
    for (var i = 0; i < entities.length; i++) {
      if (entities[i] != this && this.inSight(entities[i])) {
        averageVelocity.add(entities[i].velocity)
        averagePosition.add(entities[i].position)
        if (this.position.distanceTo(entities[i].position) < this.tooCloseDistance) {
            this.flee(entities[i].position)
        }
        inSightCount++;
      }
    }
    if (inSightCount > 0) {
      averageVelocity.divideScalar(inSightCount);
      averagePosition.divideScalar(inSightCount);
      this.seek(averagePosition);
      this.steeringForce.add(averageVelocity.sub(this.velocity))
    }
  }

  followPath(path: Vector3[], loop: boolean, thresholdRadius = 1) {
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

  avoid(obstacles: BaseSteerable[]) {
    var dynamic_length = this.velocity.length() / this.maxSpeed;
    var ahead = this.position.clone().add(this.velocity.clone().normalize().multiplyScalar(dynamic_length))
    var ahead2 = this.position.clone().add(this.velocity.clone().normalize().multiplyScalar(this.avoidDistance * .5));
    //get most threatening
    var mostThreatening = null;
    for (var i = 0; i < obstacles.length; i++) {
      if (obstacles[i] === this)
        continue;
      var collision = obstacles[i].position.distanceTo(ahead) <= obstacles[i].radius ||
        obstacles[i].position.distanceTo(ahead2) <= obstacles[i].radius
      if (collision && (
        mostThreatening == null ||
        this.position.distanceTo(obstacles[i].position) < this.position.distanceTo(mostThreatening.position)
      )) {
        mostThreatening = obstacles[i];
      }
    }
    //end
    var avoidance = new THREE.Vector3(0, 0, 0);
    if (mostThreatening != null) {
      avoidance = ahead.clone().sub(mostThreatening.position).normalize().multiplyScalar(100)
    }
    this.steeringForce.add(avoidance);
  }

  update() {
    this.steeringForce.clampLength(0, this.maxForce);
    this.steeringForce.divideScalar(this.mass);
    this.velocity.add(this.steeringForce);
    this.steeringForce.set(0, 0, 0);
    super.update();
  }

}

export const placeholderSteerable = new Steerable( new THREE.Group);
