import { initCameraPos } from 'model/stage/stage.model';
import {
  EventDispatcher,
  Vector2,
  Vector3,
  OrthographicCamera,
} from 'three';

export class PanZoomControls extends EventDispatcher {
  public enabled = true;

  /** Normalized device (x, y) mouse position */
  private ndcMouse = new Vector2;
  /** World mouse position where z = 0 */
  private mouseWorld = new Vector3;

  private dampingFactor = 0.2;

  private panSpeed = 0.2;
  private panStart = new Vector2;
  private panEnd = new Vector2;
  private panChange = new Vector2;

  private zoomSpeed = 1.2;
  private zoomStart = initCameraPos.z;
  private zoomEnd = initCameraPos.z;
  private zoomChange = 0;
  /** Used to keep mouse world position fixed when zooming */
  private zoomMouseDelta = new Vector3;
  
  private readonly epsilon = 0.0001;
  private readonly epsilonSquared = this.epsilon ** 2;

  private state: State = 'none';
  private cleanups: (() => void)[];

  constructor(
    public camera: OrthographicCamera,
    /** Making this `public` crashes redux devtools */
    canvasEl: HTMLCanvasElement,
  ) {
    super();

    canvasEl.addEventListener( 'wheel', this.onWheel, false );
    canvasEl.addEventListener( 'mousemove', this.onMove, false );
    this.cleanups = [
      () => canvasEl.removeEventListener('wheel', this.onWheel, false),
      () => canvasEl.removeEventListener('mousemove', this.onMove, false),
    ];

    this.update();
  }

  update() {
    if (!this.enabled) return false;

    this.panChange.copy(this.panEnd).sub(this.panStart);
    if (this.panChange.lengthSq() > this.epsilonSquared) {
      this.handlePan();
    } else {
      this.stop('pan');
    }

    this.zoomChange = this.zoomEnd - this.zoomStart;
    if (Math.abs(this.zoomChange) > this.epsilon) {
      this.handleZoom();
    } else {
      this.stop('zoom');
    }
  }

  handlePan() {
    this.panChange.multiplyScalar(this.panSpeed);
    this.camera.position.x -= this.panChange.x;
    this.camera.position.y += this.panChange.y;

    this.panStart.add(
      this.panChange.subVectors(this.panEnd, this.panStart)
        .multiplyScalar(this.dampingFactor)
    );
  }

  handleZoom() {
    // NOTE we do not change this.camera.position.z
    this.camera.zoom -= this.zoomChange * this.zoomSpeed;
    // TODO remove hard-coding
    this.camera.zoom = Math.max(this.camera.zoom, 20);
    this.zoomStart += this.zoomChange * this.dampingFactor;
    this.camera.updateProjectionMatrix();
    
    if (this.state !== 'pan') {
      /**
       * Keep floor point under mouse fixed.
       * Currently only works when ortho camera has no "angle".
       */
      this.ndcToWorld(this.ndcMouse, this.zoomMouseDelta);
      this.zoomMouseDelta.sub(this.mouseWorld);
      this.camera.position.x -= this.zoomMouseDelta.x;
      this.camera.position.y -= this.zoomMouseDelta.y;
    }
  }

  onWheel = (event: MouseWheelEvent) => {
    this.updateMouseWorld(event);
    if (!this.enabled) return false;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.ctrlKey) {// Pinch zoom
      this.zoomEnd += event.deltaY * 0.05;
      this.start('zoom');
    } else {
      this.panEnd.x -= event.deltaX * 0.005;
      this.panEnd.y -= event.deltaY * 0.005
      this.start('pan');
    }
  }

  onMove = (event: MouseEvent) => {
    this.updateMouseWorld(event);
  }

  private updateMouseWorld(e: MouseEvent) {
    const { left, top, width, height } = (e.currentTarget! as Element).getBoundingClientRect();
    this.ndcMouse.set(
      ((e.clientX - left) / width) * 2 - 1,
      -((e.clientY - top) / height) * 2 + 1,
    );
    this.ndcToWorld(this.ndcMouse, this.mouseWorld)
    // console.log(this.mouseWorld);
  }

  /** https://discourse.threejs.org/t/how-to-unproject-mouse2d-with-orthographic-camera/4777 */
  private ndcToWorld(ndCoords: Vector2, output: Vector3) {
    output.set(ndCoords.x, ndCoords.y, (this.camera.near + this.camera.far) / (this.camera.near - this.camera.far));
    output.unproject(this.camera).setY(0);
  }

  private start(state: State) {
    if (this.state !== state) {
      this.state = state;
      // console.log('started', state);
    }
  }

  private stop(state: State) {
    if (this.state === state) {
      this.state = 'none';
      // console.log('stopped', state);
    }
  }

  dispose() {
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups.length = 0;
  }
}

type State = 'none' | 'pan' | 'zoom';
