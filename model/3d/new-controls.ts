import { initCameraPos } from 'model/stage.model';
import {
  EventDispatcher,
  Vector2,
  Vector3,
  PerspectiveCamera,
} from 'three';

type State = 'none' | 'pan' | 'zoom';

export class NewPanZoomControls extends EventDispatcher {
  public enabled = true;
  private screen = { left: 0, top: 0, width: 0, height: 0 };
  /** Normalized device (x, y) mouse position */
  private ndcMouse = new Vector2;
  /** World mouse position where z = 0 */
  private mouseWorld = new Vector3;

  private dampingFactor = 0.2;

  private panSpeed = 0.2;
  private panStart = new Vector2;
  private panEnd = new Vector2;
  private panChange = new Vector2;

  private zoomSpeed = 0.2;
  private zoomStart = initCameraPos.z;
  private zoomEnd = initCameraPos.z;
  private zoomChange = 0;
  private zoomWorld = new Vector3;

  private state: State = 'none';
  private readonly epsilon = 0.0001;
  private readonly epsilonSquared = this.epsilon ** 2;

  constructor(
    public camera: PerspectiveCamera,
    public canvasEl: HTMLCanvasElement,
  ) {
    super();

    this.canvasEl.addEventListener('resize', this.onResize, false);
    this.canvasEl.addEventListener( 'wheel', this.onWheel, false );
    this.canvasEl.addEventListener( 'mousemove', this.onMove, false );

    this.onResize();
    this.update();
  }

  private start(state: State) {
    if (this.state !== state) {
      this.state = state;
      console.log('started', state);
    }
  }
  private stop(state: State) {
    if (this.state === state) {
      this.state = 'none';
      console.log('stopped', state);
    }
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

  // TODO keep point under mouse fixed
  handleZoom() {
    this.camera.position.z += this.zoomChange * this.zoomSpeed;
    // this.ndcToWorld(this.ndcMouse, this.mouseDelta);
    // this.mouseDelta.sub(this.mouseWorld);
    // this.camera.position.x -= this.mouseDelta.x;
    // this.camera.position.y -= this.mouseDelta.y;
    this.zoomStart += this.zoomChange * this.dampingFactor;
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

  onResize = () => {
    const rect = this.canvasEl.getBoundingClientRect();
    const d = this.canvasEl.ownerDocument!.documentElement;
    this.screen.left = rect.left + window.pageXOffset - d.clientLeft;
    this.screen.top = rect.top + window.pageYOffset - d.clientTop;
    this.screen.width = rect.width;
    this.screen.height = rect.height;
  }

  private updateMouseWorld(e: MouseEvent) {
    this.ndcMouse.set(
      ((e.clientX - this.screen.left) / this.screen.width) * 2 - 1,
      -((e.clientY - this.screen.top) / this.screen.height) * 2 + 1,
    );
    this.ndcToWorld(this.ndcMouse, this.mouseWorld)
  }

  private ndcToWorld(ndCoords: Vector2, output: Vector3) {
    output.set(ndCoords.x, ndCoords.y, 1);
    output.unproject(this.camera).sub(this.camera.position).normalize();
    output.multiplyScalar((0 - this.camera.position.z) / output.z);
    output.add(this.camera.position);
    // console.log(this.mouseWorld);
  }

  dispose() {
    this.canvasEl.removeEventListener('resize', this.onResize, false);
    this.canvasEl.removeEventListener('wheel', this.onWheel, false);
    this.canvasEl.removeEventListener('mousemove', this.onMove, false);
  }
}
