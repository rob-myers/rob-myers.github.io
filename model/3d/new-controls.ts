import { initCameraPos } from 'model/stage.model';
import {
  EventDispatcher,
  Vector2,
  Vector3,
  PerspectiveCamera,
} from 'three';

export class NewPanZoomControls extends EventDispatcher {
  public enabled = true;
  private screen = { left: 0, top: 0, width: 0, height: 0 };
  /** Normalized device (x, y) mouse position */
  private ndMousePos = new Vector2;
  /** World mouse position where z = 0 */
  private mouseWorld = new Vector3;
  private dampingFactor = 0.2;

  private panSpeed = 0.2;
  private panStart = new Vector2;
  private panEnd = new Vector2;
  private panChange = new Vector2;

  private zoomSpeed = 0.1;
  private zoomStart = initCameraPos.z;
  private zoomEnd = initCameraPos.z;
  private zoomChange = 0;
  
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

  update() {
    if (!this.enabled) return false;

    this.panChange.copy(this.panEnd).sub(this.panStart);
    if (this.panChange.lengthSq()) {
      this.handlePan();
    }

    this.zoomChange = this.zoomEnd - this.zoomStart;
    if (this.zoomChange) {
      this.handleZoom();
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
    this.zoomChange *= this.zoomSpeed;
    this.camera.position.z += this.zoomChange;
    this.zoomStart += (this.zoomEnd - this.zoomStart) * this.dampingFactor;
  }

  onWheel = (event: MouseWheelEvent) => {
    this.updateMouseWorld(event);
    if (!this.enabled) return false;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.ctrlKey) {// Pinch zoom
      this.zoomEnd += event.deltaY * 0.05;
    } else {
      this.panEnd.x -= event.deltaX * 0.005;
      this.panEnd.y -= event.deltaY * 0.005
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

  updateMouseWorld(e: MouseEvent) {
    this.ndMousePos.set(
      ((e.clientX - this.screen.left) / this.screen.width) * 2 - 1,
      -((e.clientY - this.screen.top) / this.screen.height) * 2 + 1,
    );
    this.mouseWorld.set(this.ndMousePos.x, this.ndMousePos.y, 1);
    this.mouseWorld.unproject(this.camera).sub(this.camera.position).normalize();
    this.mouseWorld.multiplyScalar((0 - this.camera.position.z) / this.mouseWorld.z);
    this.mouseWorld.add(this.camera.position);
    // console.log(this.mouseWorld);
  }

  dispose() {
    this.canvasEl.removeEventListener('resize', this.onResize, false);
    this.canvasEl.removeEventListener('wheel', this.onWheel, false);
    this.canvasEl.removeEventListener('mousemove', this.onMove, false);
  }
}
