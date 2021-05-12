/**
 * This is OrbitControls.js restricted to Orthographic camera.
 */
import {
	EventDispatcher,
  Matrix4,
	MOUSE,
  OrthographicCamera,
	Quaternion,
	Spherical,
	TOUCH,
	Vector2,
	Vector3
} from 'three';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

export class PanZoomControls extends EventDispatcher {

  /** Set to false to disable this control */
  enabled = true;
  /** "target" sets the location of focus, where the object orbits around */
  target = new Vector3;

  /** How far you can zoom orthographic camera in */
  minZoom = 0;
  /** How far you can zoom orthographic camera out */
  maxZoom = Infinity;

  /** Lower limit of vertical orbit in [0, Math.PI] */
  minPolarAngle = 0;
  /** Upper limit of vertical orbit in [0, Math.PI] */
  maxPolarAngle = Math.PI / 4;

  /** Lower limit of horizontal orbit. If set, collectively in `[-2 PI, 2 PI]` with `max - min < 2 PI` */
  minAzimuthAngle = - Infinity;
  /** Upper limit of horizontal orbit. If set, collectively in `[-2 PI, 2 PI]` with `max - min < 2 PI` */
  maxAzimuthAngle = Infinity;
 
  /** Set to true to enable damping (inertia). If enabled, you must call controls.update() in your animation loop. */
  enableDamping = false;
  dampingFactor = 0.05;

  /** This option actually enables dollying in and out; left as "zoom" for backwards compatibility */
  enableZoom = true;
  zoomSpeed = 1.0;

  /** Set to false to disable rotating. */
  enableRotate = true;
  rotateSpeed = 1.0;

  /** Set to false to disable panning */
  enablePan = true;
  panSpeed = 1.0;
  /** If false, pan orthogonal to world-space direction camera.up */
  screenSpacePanning = true;
  /** Pixels moved per arrow key push */
  keyPanSpeed = 7.0;

  /** The four arrow keys */
  private keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
  /** Mouse buttons */
  private mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
  /** Touch fingers */
  private touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
  /** For reset */
  private initial: {
    target: Vector3,
    position: Vector3,
    zoom: number,
  };

  private EPS = 0.000001;

  // current position in spherical coordinates
  private spherical = new Spherical;
  private sphericalDelta = new Spherical;

  private scale = 1;
  private panOffset = new Vector3;
  private zoomChanged = false;

  private rotateStart = new Vector2;
  private rotateEnd = new Vector2;
  private rotateDelta = new Vector2;

  private panStart = new Vector2;
  private panEnd = new Vector2;
  private panDelta = new Vector2;

  private dollyStart = new Vector2;
  private dollyEnd = new Vector2;
  private dollyDelta = new Vector2;

  private STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };
  private state = this.STATE.NONE;
  private getDomElement: () => HTMLCanvasElement;

	constructor(
    public camera: OrthographicCamera,
    /** Exposing this via public/private can break serialization */
    domElement: HTMLCanvasElement,
  ) {
		super();

    this.initial = {
      target: this.target.clone(),
      position: this.camera.position.clone(),
      zoom: this.camera.zoom,
    };

    domElement.addEventListener( 'contextmenu', this.onContextMenu.bind(this) );

    domElement.addEventListener( 'pointerdown', this.onPointerDown.bind(this) );
    domElement.addEventListener( 'wheel', this.onMouseWheel.bind(this), { passive: false } );

    domElement.addEventListener( 'touchstart', this.onTouchStart.bind(this), { passive: false } );
    domElement.addEventListener( 'touchend', this.onTouchEnd.bind(this) );
    domElement.addEventListener( 'touchmove', this.onTouchMove.bind(this), { passive: false } );

    this.getDomElement = () => domElement;
    // force an update at start
    this.update();
  }


  dollyOut( dollyScale: number ) {
    this.camera.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.camera.zoom * dollyScale ) );
    this.camera.updateProjectionMatrix();
    this.zoomChanged = true;
  }
  dollyIn(dollyScale: number) {
    this.camera.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.camera.zoom / dollyScale ) );
    this.camera.updateProjectionMatrix();
    this.zoomChanged = true;
  }

  getAzimuthalAngle() {
    return this.spherical.theta;
  }
  getPolarAngle() {
    return this.spherical.phi;
  }
  getZoomScale() {
    return Math.pow( 0.95, this.zoomSpeed );
  }

  // deltaX and deltaY are in pixels; right and down are positive
  pan = (deltaX: number, deltaY: number) => {
    const element = this.getDomElement();
    // orthographic
    this.panLeft( deltaX * ( this.camera.right - this.camera.left ) / this.camera.zoom / element.clientWidth, this.camera.matrix );
    this.panUp( deltaY * ( this.camera.top - this.camera.bottom ) / this.camera.zoom / element.clientHeight, this.camera.matrix );
  };
  panLeft = (() => {
    const v = new Vector3;
    return (distance: number, objectMatrix: Matrix4) => {
      v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
      v.multiplyScalar( - distance );
      this.panOffset.add( v );
    };
  })();
  panUp = (() => {
    const v = new Vector3;
    return (distance: number, cameraMatrix: Matrix4) => {
      if (this.screenSpacePanning === true ) {
        v.setFromMatrixColumn( cameraMatrix, 1 );
      } else {
        v.setFromMatrixColumn( cameraMatrix, 0 );
        v.crossVectors( this.camera.up, v );
      }
      v.multiplyScalar( distance );
      this.panOffset.add( v );
    };
  })();

  rotateLeft(angle: number) {
    this.sphericalDelta.theta -= angle;
  }
  rotateUp(angle: number) {
    this.sphericalDelta.phi -= angle;
  }

  saveState() {
    this.initial.target.copy(this.target);
    this.initial.position.copy(this.camera.position);
    this.initial.zoom = this.camera.zoom;
  }

  reset() {
    this.target.copy(this.initial.target);
    this.camera.position.copy(this.initial.position);
    this.camera.zoom = this.initial.zoom;

    this.camera.updateProjectionMatrix();
    this.dispatchEvent({ type: 'change' });

    this.update();
    this.state = this.STATE.NONE;
  };

  update = (() => {
    const offset = new Vector3;
    // So camera.up is the orbit axis
    const quat = (new Quaternion).setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0));
    const quatInverse = quat.clone().invert();
    const lastPosition = new Vector3;
    const lastQuaternion = new Quaternion;
    const twoPI = 2 * Math.PI;
    const [spherical, sphericalDelta] = [this.spherical, this.sphericalDelta];

    return () => {
      const position = this.camera.position;
      offset.copy(position).sub(this.target);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);
      // angle from z-axis around y-axis
      spherical.setFromVector3( offset );

      if (this.enableDamping) {
        spherical.theta += sphericalDelta.theta * this.dampingFactor;
        spherical.phi += sphericalDelta.phi * this.dampingFactor;
      } else {
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
      }

      // restrict theta to be between desired limits
      let min = this.minAzimuthAngle;
      let max = this.maxAzimuthAngle;

      if ( isFinite( min ) && isFinite( max ) ) {
        if ( min < - Math.PI ) min += twoPI; else if ( min > Math.PI ) min -= twoPI;
        if ( max < - Math.PI ) max += twoPI; else if ( max > Math.PI ) max -= twoPI;
        if ( min <= max ) {
          spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );
        } else {
          spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
            Math.max( min, spherical.theta ) :
            Math.min( max, spherical.theta );
        }
      }

      // restrict phi to be between desired limits
      spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.phi ) );
      spherical.makeSafe();
      spherical.radius *= this.scale;
      // restrict radius to be between desired limits
      // spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, spherical.radius ) );

      // move target to panned location
      if (this.enableDamping) {
        this.target.addScaledVector( this.panOffset, this.dampingFactor );
      } else {
        this.target.add( this.panOffset );
      }

      offset.setFromSpherical( spherical );

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion( quatInverse );

      position.copy( this.target ).add( offset );
      this.camera.lookAt( this.target );

      if (this.enableDamping) {
        sphericalDelta.theta *= ( 1 - this.dampingFactor );
        sphericalDelta.phi *= ( 1 - this.dampingFactor );
        this.panOffset.multiplyScalar( 1 - this.dampingFactor );
      } else {
        sphericalDelta.set( 0, 0, 0 );
        this.panOffset.set( 0, 0, 0 );
      }

      this.scale = 1;
      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (
        this.zoomChanged
        || lastPosition.distanceToSquared( this.camera.position ) > this.EPS
        || 8 * ( 1 - lastQuaternion.dot( this.camera.quaternion ) ) > this.EPS
      ) {

        this.dispatchEvent({ type: 'change' });

        lastPosition.copy( this.camera.position );
        lastQuaternion.copy( this.camera.quaternion );
        this.zoomChanged = false;
        return true;
      }
      return false;
    };

  })();

  dispose() {
    const domElement = this.getDomElement();
    domElement.removeEventListener( 'contextmenu', this.onContextMenu );

    domElement.removeEventListener( 'pointerdown', this.onPointerDown );
    domElement.removeEventListener( 'wheel', this.onMouseWheel );

    domElement.removeEventListener( 'touchstart', this.onTouchStart );
    domElement.removeEventListener( 'touchend', this.onTouchEnd );
    domElement.removeEventListener( 'touchmove', this.onTouchMove );

    domElement.ownerDocument.removeEventListener( 'pointermove', this.onPointerMove );
    domElement.ownerDocument.removeEventListener( 'pointerup', this.onPointerUp );
    //this.dispatchEvent( { type: 'dispose' } ); // should this be added here?
  }

  handleMouseDownRotate(event: MouseEvent) {
    this.rotateStart.set( event.clientX, event.clientY );
  }

  handleMouseDownDolly(event: MouseEvent) {
    this.dollyStart.set( event.clientX, event.clientY );
  }

  handleMouseDownPan(event: MouseEvent) {
    this.panStart.set( event.clientX, event.clientY );
  }

  handleMouseMoveRotate(event: MouseEvent) {
    this.rotateEnd.set( event.clientX, event.clientY );
    this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.rotateSpeed );
    const element = this.getDomElement();
    this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height
    this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );
    this.rotateStart.copy( this.rotateEnd );
    this.update();
  }

  handleMouseMoveDolly(event: MouseEvent) {
    this.dollyEnd.set( event.clientX, event.clientY );
    this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );
    if ( this.dollyDelta.y > 0 ) {
      this.dollyOut( this.getZoomScale() );
    } else if ( this.dollyDelta.y < 0 ) {
      this.dollyIn( this.getZoomScale() );
    }

    this.dollyStart.copy( this.dollyEnd );
    this.update();
  }

  handleMouseMovePan(event: MouseEvent) {
    this.panEnd.set( event.clientX, event.clientY );
    this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );
    this.pan( this.panDelta.x, this.panDelta.y );
    this.panStart.copy( this.panEnd );
    this.update();
  }

  handleMouseUp(event?: MouseEvent) {
    // no-op
  }

  handleMouseWheel(event: MouseWheelEvent) {
    if (event.deltaY < 0) {
      this.dollyIn( this.getZoomScale() );
    } else if ( event.deltaY > 0 ) {
      this.dollyOut( this.getZoomScale() );
    }

    this.update();
  }

  handleKeyDown(event: KeyboardEvent) {
    let needsUpdate = false;

    switch ( event.code ) {

      case this.keys.UP:
        this.pan( 0, this.keyPanSpeed );
        needsUpdate = true;
        break;

      case this.keys.BOTTOM:
        this.pan( 0, - this.keyPanSpeed );
        needsUpdate = true;
        break;

      case this.keys.LEFT:
        this.pan( this.keyPanSpeed, 0 );
        needsUpdate = true;
        break;

      case this.keys.RIGHT:
        this.pan( - this.keyPanSpeed, 0 );
        needsUpdate = true;
        break;

    }

    if ( needsUpdate ) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();
      this.update();
    }

  }

  handleTouchStartRotate(event: TouchEvent) {
    if ( event.touches.length == 1 ) {
      this.rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.rotateStart.set( x, y );
    }
  }

  handleTouchStartPan(event: TouchEvent) {
    if ( event.touches.length == 1 ) {
      this.panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.panStart.set( x, y );
    }
  }

  handleTouchStartDolly(event: TouchEvent) {
    const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    const distance = Math.sqrt( dx * dx + dy * dy );
    this.dollyStart.set( 0, distance );
  }

  handleTouchStartDollyPan(event: TouchEvent) {
    if ( this.enableZoom ) this.handleTouchStartDolly( event );
    if ( this.enablePan ) this.handleTouchStartPan( event );
  }

  handleTouchStartDollyRotate(event: TouchEvent) {
    if ( this.enableZoom ) this.handleTouchStartDolly( event );
    if ( this.enableRotate ) this.handleTouchStartRotate( event );
  }

  handleTouchMoveRotate(event: TouchEvent) {
    if ( event.touches.length == 1 ) {
      this.rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.rotateEnd.set( x, y );
    }

    this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.rotateSpeed );
    const element = this.getDomElement();
    this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height
    this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );
    this.rotateStart.copy( this.rotateEnd );
  }

  handleTouchMovePan(event: TouchEvent) {
    if ( event.touches.length == 1 ) {
      this.panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    } else {
      const x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
      const y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
      this.panEnd.set( x, y );
    }
    this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );
    this.pan( this.panDelta.x, this.panDelta.y );
    this.panStart.copy( this.panEnd );
  }

  handleTouchMoveDolly(event: TouchEvent) {
    const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    const distance = Math.sqrt( dx * dx + dy * dy );
    this.dollyEnd.set( 0, distance );
    this.dollyDelta.set( 0, Math.pow( this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed ) );
    this.dollyOut( this.dollyDelta.y );
    this.dollyStart.copy( this.dollyEnd );
  }

  handleTouchMoveDollyPan(event: TouchEvent) {
    if ( this.enableZoom ) this.handleTouchMoveDolly( event );
    if ( this.enablePan ) this.handleTouchMovePan( event );
  }

  handleTouchMoveDollyRotate(event: TouchEvent) {
    if ( this.enableZoom ) this.handleTouchMoveDolly( event );
    if ( this.enableRotate ) this.handleTouchMoveRotate( event );
  }

  handleTouchEnd( event?: TouchEvent) {
    // no-op
  }

  onPointerDown(event: PointerEvent) {
    if (!this.enabled) return;

    switch ( event.pointerType ) {
      case 'mouse':
      case 'pen':
        this.onMouseDown( event );
        break;
      // TODO touch
    }
  }

  onPointerMove(event: PointerEvent) {
    if (!this.enabled) return;

    switch ( event.pointerType ) {
      case 'mouse':
      case 'pen':
        this.onMouseMove( event );
        break;
      // TODO touch
    }
  }

  onPointerUp(event: PointerEvent) {
    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseUp( event );
        break;
      // TODO touch
    }
  }

  onMouseDown(event: MouseEvent) {
    // Prevent the browser from scrolling.
    event.preventDefault();

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.
    this.getDomElement().focus();

    let mouseAction;
    switch ( event.button ) {
      case 0:
        mouseAction = this.mouseButtons.LEFT;
        break;
      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
        break;
      case 2:
        mouseAction = this.mouseButtons.RIGHT;
        break;
      default:
        mouseAction = - 1;
    }

    switch ( mouseAction ) {
      case MOUSE.DOLLY:
        if ( this.enableZoom === false ) return;
        this.handleMouseDownDolly( event );
        this.state = this.STATE.DOLLY;
        break;

      case MOUSE.ROTATE:
        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
          if ( this.enablePan === false ) return;
          this.handleMouseDownPan( event );
          this.state = this.STATE.PAN;
        } else {
          if ( this.enableRotate === false ) return;
          this.handleMouseDownRotate( event );
          this.state = this.STATE.ROTATE;
        }
        break;

      case MOUSE.PAN:
        if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
          if ( this.enableRotate === false ) return;
          this.handleMouseDownRotate( event );
          this.state = this.STATE.ROTATE;
        } else {
          if ( this.enablePan === false ) return;
          this.handleMouseDownPan( event );
          this.state = this.STATE.PAN;
        }
        break;

      default:
        this.state = this.STATE.NONE;
    }

    if ( this.state !== this.STATE.NONE ) {
      this.getDomElement().ownerDocument.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
      this.getDomElement().ownerDocument.addEventListener( 'pointerup', this.onPointerUp.bind(this) );
      this.dispatchEvent({ type: 'start' });
    }

  }

  onMouseMove(event: MouseEvent) {
    if (!this.enabled) return;

    event.preventDefault();

    switch ( this.state ) {
      case this.STATE.ROTATE:
        if ( this.enableRotate === false ) return;
        this.handleMouseMoveRotate( event );
        break;

      case this.STATE.DOLLY:
        if ( this.enableZoom === false ) return;
        this.handleMouseMoveDolly( event );
        break;

      case this.STATE.PAN:
        if ( this.enablePan === false ) return;
        this.handleMouseMovePan( event );
        break;

    }

  }

  onMouseUp( event: MouseEvent ) {
    this.getDomElement().ownerDocument.removeEventListener( 'pointermove', this.onPointerMove );
    this.getDomElement().ownerDocument.removeEventListener( 'pointerup', this.onPointerUp );

    if ( this.enabled === false ) return;

    this.handleMouseUp(event);
    this.dispatchEvent({ type: 'end' });
    this.state = this.STATE.NONE;
  }

  onMouseWheel( event: MouseWheelEvent ) {
    if ( this.enabled === false || this.enableZoom === false || ( this.state !== this.STATE.NONE && this.state !== this.STATE.ROTATE ) ) return;

    event.preventDefault();

    this.dispatchEvent({ type: 'start' });
    this.handleMouseWheel( event );
    this.dispatchEvent({ type: 'end' });
  }

  onKeyDown( event: KeyboardEvent ) {

    if ( this.enabled === false || this.enablePan === false ) return;

    this.handleKeyDown( event );

  }

  onTouchStart( event: TouchEvent ) {
    if (!this.enabled) return;

    event.preventDefault(); // prevent scrolling

    switch ( event.touches.length ) {
      case 1:
        switch ( this.touches.ONE ) {
          case TOUCH.ROTATE:
            if ( this.enableRotate === false ) return;
            this.handleTouchStartRotate( event );
            this.state = this.STATE.TOUCH_ROTATE;
            break;

          case TOUCH.PAN:
            if ( this.enablePan === false ) return;
            this.handleTouchStartPan( event );
            this.state = this.STATE.TOUCH_PAN;
            break;
          default:
            this.state = this.STATE.NONE;
        }
        break;

      case 2:

        switch ( this.touches.TWO ) {
          case TOUCH.DOLLY_PAN:
            if ( this.enableZoom === false && this.enablePan === false ) return;
            this.handleTouchStartDollyPan( event );
            this.state = this.STATE.TOUCH_DOLLY_PAN;
            break;

          case TOUCH.DOLLY_ROTATE:
            if ( this.enableZoom === false && this.enableRotate === false ) return;
            this.handleTouchStartDollyRotate( event );
            this.state = this.STATE.TOUCH_DOLLY_ROTATE;
            break;

          default:
            this.state = this.STATE.NONE;
        }
        break;

      default:
        this.state = this.STATE.NONE;
    }

    if ( this.state !== this.STATE.NONE ) {
      this.dispatchEvent({ type: 'start' });
    }

  }

  onTouchMove( event: TouchEvent ) {
    if ( this.enabled === false ) return;
    event.preventDefault(); // prevent scrolling
    switch ( this.state ) {
      case this.STATE.TOUCH_ROTATE:
        if ( this.enableRotate === false ) return;
        this.handleTouchMoveRotate( event );
        this.update();
        break;

      case this.STATE.TOUCH_PAN:
        if ( this.enablePan === false ) return;
        this.handleTouchMovePan( event );
        this.update();
        break;

      case this.STATE.TOUCH_DOLLY_PAN:
        if ( this.enableZoom === false && this.enablePan === false ) return;
        this.handleTouchMoveDollyPan( event );
        this.update();
        break;

      case this.STATE.TOUCH_DOLLY_ROTATE:
        if ( this.enableZoom === false && this.enableRotate === false ) return;
        this.handleTouchMoveDollyRotate( event );
        this.update();
        break;

      default:
        this.state = this.STATE.NONE;
    }

  }

  onTouchEnd( event: TouchEvent ) {
    if ( this.enabled === false ) return;
    this.handleTouchEnd( event );
    this.dispatchEvent({ type: 'end' });
    this.state = this.STATE.NONE;
  }

  onContextMenu( event: Event ) {
    if ( this.enabled === false ) return;
    event.preventDefault();
  }

}


// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

// class MapControls extends OrbitControls {

// 	constructor( object, domElement ) {

// 		super( object, domElement );

// 		this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up

// 		this.mouseButtons.LEFT = MOUSE.PAN;
// 		this.mouseButtons.RIGHT = MOUSE.ROTATE;

// 		this.touches.ONE = TOUCH.PAN;
// 		this.touches.TWO = TOUCH.DOLLY_ROTATE;

// 	}

// }

// export { OrbitControls, MapControls };
