import {
  EventDispatcher,
  // MOUSE,
  // Quaternion,
  Vector2,
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
} from 'three';

export class PanZoomControls extends EventDispatcher {

  public enabled = true;
  public screen = { left: 0, top: 0, width: 0, height: 0 };
  // public rotateSpeed = 1.0;
  public zoomSpeed = 1;
  public panSpeed = 0.1;
  public noRotate = false;
  public noZoom = false;
  public noPan = false;
  public staticMoving = false;
  public dynamicDampingFactor = 0.2;
  public minDistance = 0;
  public maxDistance = Infinity;
  // this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
  // this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.ZOOM, RIGHT: MOUSE.PAN };

  private readonly STATE = {
    NONE: -1,
    // ROTATE: 0,
    ZOOM: 1,
    PAN: 2,
    // TOUCH_ROTATE: 3,
    TOUCH_ZOOM_PAN: 4,
  };
  private target = new Vector3();
  private readonly EPS = 0.000001;
  private lastPosition = new Vector3();
  private lastZoom = 1;

  private state = this.STATE.NONE;
  private keyState = this.STATE.NONE;

  private eye = new Vector3();

  // private movePrev = new Vector2();
  // private moveCurr = new Vector2();
  // private lastAxis = new Vector3();
  // private lastAngle = 0;

  private zoomStart = new Vector2();
  private zoomEnd = new Vector2();

  private touchZoomDistanceStart = 0;
  private touchZoomDistanceEnd = 0;

  private panStart = new Vector2();
  private panEnd = new Vector2();

  private readonly initial = {
    target: this.target.clone(),
    position: this.camera.position.clone(),
    up: this.camera.up.clone(),
    zoom: this.camera.zoom,
  };

  private readonly event = {
    change: { type: 'change' },
    start: { type: 'start' },
    end: { type: 'end' },
  }

  // getMouseOnScreen
  private mouseScreen = new Vector2;
  // getMouseOnCircle
  private mouseCircle = new Vector2;
  // panCamera
  private pan = {
    mouseChange: new Vector2,
    cameraUp: new Vector3,
    delta: new Vector3,
  }

  constructor(
    public camera: PerspectiveCamera | OrthographicCamera,
    public domEl: Element,
  ) {
    super();

    // listeners already bound to `this` because they're arrow fns
    this.domEl.addEventListener( 'contextmenu', this.contextmenu, false );
    this.domEl.addEventListener( 'mousedown', this.mousedown as EventListener, false );
    this.domEl.addEventListener( 'wheel', this.mousewheel as EventListener, false );
    this.domEl.addEventListener( 'touchstart', this.touchstart as EventListener, false );
    this.domEl.addEventListener( 'touchend', this.touchend as EventListener, false );
    this.domEl.addEventListener( 'touchmove', this.touchmove as EventListener, false );
  
    // window.addEventListener( 'keydown', keydown, false );
    // window.addEventListener( 'keyup', keyup, false );
  
    this.handleResize();
  
    // force an update at start
    this.update();
  }

  handleResize() {
    const box = this.domEl.getBoundingClientRect();
    // adjustments come from similar code in the jquery offset() function
    const d = this.domEl.ownerDocument!.documentElement;
    this.screen.left = box.left + window.pageXOffset - d.clientLeft;
    this.screen.top = box.top + window.pageYOffset - d.clientTop;
    this.screen.width = box.width;
    this.screen.height = box.height;
  }

  getMouseOnScreen(pageX: number, pageY: number) {
    return this.mouseScreen.set(
      ( pageX - this.screen.left ) / this.screen.width,
      ( pageY - this.screen.top ) / this.screen.height
    );
  }

  // getMouseOnCircle(pageX: number, pageY: number) {
  //   return this.mouseCircle.set(
  //     ( ( pageX - this.screen.width * 0.5 - this.screen.left ) / ( this.screen.width * 0.5 ) ),
  //     ( ( this.screen.height + 2 * ( this.screen.top - pageY ) ) / this.screen.width ) // screen.width intentional
  //   );
  // }

  zoomCamera() {
    let factor: number;
    if (this.state === this.STATE.TOUCH_ZOOM_PAN) {
      factor = this.touchZoomDistanceStart / this.touchZoomDistanceEnd;
      this.touchZoomDistanceStart = this.touchZoomDistanceEnd;

      if (isPerspective(this.camera)) {
        this.eye.multiplyScalar(factor);
      } else if (isOrthographic(this.camera)) {
        this.camera.zoom *= factor;
        this.camera.updateProjectionMatrix();
      } else {
        console.warn( 'PanZoomControls: Unsupported camera type');
      }
    } else {
      factor = 1.0 + (this.zoomEnd.y - this.zoomStart.y) * this.zoomSpeed;

      if ( factor !== 1.0 && factor > 0.0 ) {
        if (isPerspective(this.camera)) {
          this.eye.multiplyScalar(factor);
        } else if (isOrthographic(this.camera)) {
          this.camera.zoom /= factor;
          this.camera.updateProjectionMatrix();
        } else {
          console.warn('PanZoomControls: Unsupported camera type');
        }

      }

      if (this.staticMoving ) {
        this.zoomStart.copy(this.zoomEnd);
      } else {
        this.zoomStart.y += (this.zoomEnd.y - this.zoomStart.y ) * this.dynamicDampingFactor;
      }
    }

  }

  panCamera() {
    const { mouseChange, delta, cameraUp } = this.pan;
    mouseChange.copy(this.panEnd).sub(this.panStart);

    if (mouseChange.lengthSq()) {
      if (isOrthographic(this.camera)) {
        const scaleX = ( this.camera.right - this.camera.left ) /this.camera.zoom / this.domEl.clientWidth;
        const scaleY = ( this.camera.top - this.camera.bottom ) / this.camera.zoom / this.domEl.clientWidth;
        mouseChange.x *= scaleX;
        mouseChange.y *= scaleY;
      }

      mouseChange.multiplyScalar(this.eye.length() * this.panSpeed );

      delta.copy(this.eye).cross(this.camera.up).setLength(mouseChange.x);
      delta.add(cameraUp.copy(this.camera.up).setLength(mouseChange.y));

      this.camera.position.add(delta);
      this.target.add(delta);

      if (this.staticMoving) {
        this.panStart.copy(this.panEnd);
      } else {
        this.panStart.add(mouseChange.subVectors(this.panEnd, this.panStart).multiplyScalar(this.dynamicDampingFactor));
      }
    }
  }

  checkDistances() {
    if (!this.noZoom || !this.noPan) {
      if (this.eye.lengthSq() > this.maxDistance * this.maxDistance ) {
        this.camera.position.addVectors( this.target, this.eye.setLength( this.maxDistance ) );
        this.zoomStart.copy(this.zoomEnd );
      }
      if (this.eye.lengthSq() < this.minDistance * this.minDistance ) {
        this.camera.position.addVectors(this.target, this.eye.setLength( this.minDistance ) );
        this.zoomStart.copy(this.zoomEnd );
      }
    }
  }

  update() {
    this.eye.subVectors(this.camera.position, this.target );

    if (!this.noZoom ) {
      this.zoomCamera();
    }

    if (!this.noPan ) {
      this.panCamera();
    }

    this.camera.position.addVectors(this.target, this.eye);

    if (isPerspective(this.camera)) {
      this.checkDistances();
      this.camera.lookAt(this.target);

      if (this.lastPosition.distanceToSquared(this.camera.position ) > this.EPS ) {
        this.dispatchEvent(this.event.change);
        this.lastPosition.copy(this.camera.position);
      }
    } else if (isOrthographic(this.camera)) {
      this.camera.lookAt( this.target );

      if (
        this.lastPosition.distanceToSquared(this.camera.position ) > this.EPS
        || this.lastZoom !== this.camera.zoom
      ) {
        this.dispatchEvent(this.event.change);
        this.lastPosition.copy( this.camera.position );
        this.lastZoom = this.camera.zoom;
      }
    } else {
      console.warn( 'PanZoomControls: Unsupported camera type' );
    }
  }

  reset() {
    this.state = this.STATE.NONE;
    this.keyState = this.STATE.NONE;

    this.target.copy( this.initial.target );
    this.camera.position.copy(this.initial.position);
    this.camera.up.copy(this.initial.up);
    this.camera.zoom = this.initial.zoom;

    this.camera.updateProjectionMatrix();

    this.eye.subVectors( this.camera.position, this.target );

    this.camera.lookAt( this.target );

    this.dispatchEvent( this.event.change );

    this.lastPosition.copy( this.camera.position );
    this.lastZoom = this.camera.zoom;
  }

  // Listeners must be arrow fns
  mousedown = (event: MouseEvent) => {
    if (this.enabled === false ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.state === this.STATE.NONE ) {
      switch ( event.button ) {
        // case scope.mouseButtons.LEFT:
        case 0:
          // this.state = this.STATE.ROTATE;
          // this.state = this.STATE.PAN;
          this.state = this.STATE.ZOOM;
          break;
        // case scope.mouseButtons.MIDDLE:
        case 1:
          // this.state = this.STATE.ZOOM;
          this.state = this.STATE.PAN;
          break;

        // case scope.mouseButtons.RIGHT:
        case 2:
          this.state = this.STATE.PAN;
          break;

        default:
          this.state = this.STATE.NONE;
      }
    }

    const state = ( this.keyState !== this.STATE.NONE ) ? this.keyState : this.state;

    // if (state === this.STATE.ROTATE && !this.noRotate ) {
    //   this.moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
    //   _movePrev.copy( _moveCurr );
    // }
    if (state === this.STATE.ZOOM && !this.noZoom ) {
      this.zoomStart.copy( this.getMouseOnScreen( event.pageX, event.pageY ) );
      this.zoomEnd.copy( this.zoomStart );
    } else if ( state === this.STATE.PAN && !this.noPan ) {
      this.panStart.copy( this.getMouseOnScreen( event.pageX, event.pageY ) );
      this.panEnd.copy( this.panStart );
    }

    this.domEl.ownerDocument!.addEventListener( 'mousemove', this.mousemove, false );
    this.domEl.ownerDocument!.addEventListener( 'mouseup', this.mouseup, false );

    this.dispatchEvent( this.event.start );
  }

  mousemove = (event: MouseEvent) => {
    if (this.enabled === false) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const state = ( this.keyState !== this.STATE.NONE ) ? this.keyState : this.state;

    // if ( state === this.STATE.ROTATE && ! this.noRotate ) {
    //   this.movePrev.copy( this.moveCurr );
    //   this.moveCurr.copy( this.getMouseOnCircle( event.pageX, event.pageY ) );
    // }
    if ( state === this.STATE.ZOOM && !this.noZoom ) {
      this.zoomEnd.copy( this.getMouseOnScreen( event.pageX, event.pageY ) );
    } else if ( state === this.STATE.PAN && !this.noPan ) {
      this.panEnd.copy( this.getMouseOnScreen( event.pageX, event.pageY ) );
    }
  }

  mouseup = (event: MouseEvent) => {
    if (this.enabled === false ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.state = this.STATE.NONE;

    this.domEl.ownerDocument!.removeEventListener( 'mousemove', this.mousemove );
    this.domEl.ownerDocument!.removeEventListener( 'mouseup', this.mouseup );
    this.dispatchEvent( this.event.end );

  }

  mousewheel = (event: MouseWheelEvent) => {
    if (this.enabled === false) {
      return;
    }
    if (this.noPan === true) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.ctrlKey) {// Pinch zoom
      switch (event.deltaMode) {
        case 2:
          // Zoom in pages
          this.zoomStart.y -= event.deltaY * 0.025;
          break;
        case 1:
          // Zoom in lines
          this.zoomStart.y -= event.deltaY * 0.01;
          break;
        default:
          // undefined, 0, assume pixels
          // this.zoomStart.y -= event.deltaY * 0.00025;
          this.zoomStart.y -= event.deltaY * 0.005;
          break;
      }
    } else {
      this.panEnd.x -= event.deltaX * 0.005;
      this.panEnd.y -= event.deltaY * 0.005;
    }

    this.dispatchEvent( this.event.start );
    this.dispatchEvent( this.event.end );
  }

  touchstart = (event: TouchEvent) => {
    if (this.enabled === false ) {
      return;
    }

    event.preventDefault();

    switch ( event.touches.length ) {
      case 1:
        // this.state = this.STATE.TOUCH_ROTATE;
        // this.moveCurr.copy( this.getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        // this.movePrev.copy( this.moveCurr );
        this.state = this.STATE.TOUCH_ZOOM_PAN;
        this.panEnd.copy( this.getMouseOnScreen( event.touches[ 0 ].pageX,event.touches[ 0 ].pageY ) );
        break;

      default: {// 2 or more
        this.state = this.STATE.TOUCH_ZOOM_PAN;
        const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        this.touchZoomDistanceEnd = this.touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

        const x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
        const y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
        this.panStart.copy( this.getMouseOnScreen( x, y ) );
        this.panEnd.copy( this.panStart );
        break;
      }
    }

    this.dispatchEvent( this.event.start );
  }

  touchmove = (event: TouchEvent) => {
    if (this.enabled === false ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length ) {
      case 1:
        // this.movePrev.copy(this.moveCurr );
        // this.moveCurr.copy(this.getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        this.panEnd.copy( this.getMouseOnScreen( event.touches[ 0 ].pageX,event.touches[ 0 ].pageY ) );
        break;
      default: {// 2 or more
        const dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        const dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        this.touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

        const x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
        const y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
        this.panEnd.copy( this.getMouseOnScreen( x, y ) );
        break;
      }
    }
  }

  touchend = (event: TouchEvent) => {
    if (this.enabled === false ) {
      return;
    }

    switch (event.touches.length ) {
      case 0:
        this.state = this.STATE.NONE;
        break;
      case 1:
        // this.state = this.STATE.TOUCH_ROTATE;
        // this.moveCurr.copy( this.getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
        // this.movePrev.copy( this.moveCurr );
        this.panEnd.copy( this.getMouseOnScreen( event.touches[ 0 ].pageX,event.touches[ 0 ].pageY ) );
        this.state = this.STATE.NONE;
        break;
    }
    this.dispatchEvent( this.event.end );
  }

  // Includes RMB
  contextmenu = (_event: Event) => {
    // if (this.enabled === false ) return;
    // event.preventDefault();
  }

  dispose() {
    this.domEl.removeEventListener( 'contextmenu', this.contextmenu, false );
    this.domEl.removeEventListener( 'mousedown', this.mousedown as EventListener, false );
    this.domEl.removeEventListener( 'wheel', this.mousewheel as EventListener, false );
    this.domEl.removeEventListener( 'touchstart', this.touchstart as EventListener, false );
    this.domEl.removeEventListener( 'touchend', this.touchend as EventListener, false );
    this.domEl.removeEventListener( 'touchmove', this.touchmove as EventListener, false );
    this.domEl.ownerDocument!.removeEventListener( 'mousemove', this.mousemove as EventListener, false );
    this.domEl.ownerDocument!.removeEventListener( 'mouseup', this.mouseup as EventListener, false );
    // window.removeEventListener( 'keydown', keydown, false );
    // window.removeEventListener( 'keyup', keyup, false );
  }
}

function isOrthographic(camera: PerspectiveCamera | OrthographicCamera): camera is OrthographicCamera {
  return (camera as OrthographicCamera).isOrthographicCamera;
}

function isPerspective(camera: PerspectiveCamera | OrthographicCamera): camera is PerspectiveCamera {
  return (camera as PerspectiveCamera).isPerspectiveCamera;
}
