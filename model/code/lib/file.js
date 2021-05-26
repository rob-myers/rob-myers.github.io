function clear({ scene }) {
  scene.children.slice().forEach(child => scene.remove(child));
}

function addCube({ scene, util }) {
  const cube = util.cube();
  scene.add(cube);
  return cube;
}

function addLight({ scene, util }) {
  const light = util.light();
  scene.add(light);
  return light;
}

function addGrid({ scene, util }) {
  scene.add(util.grid());
}

function addAxes({ scene, util }) {
  scene.add(util.axes());
}

function addPointerPlane({ scene, util }) {
  const plane = util.plane("PointerPlane", 40, 40);
  plane.visible = false;
  scene.add(plane);
}

class Util {
  constructor(lib) {
    this.lib = lib;
  }

  cube(name = "TempCube") {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("#0000ff")}),
    );
    cube.position.setY(0.5);
    cube.name = name;
    return cube;
  }

  plane(name = "TempPlane", width = 1, height = 1) {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("#ff0000")}),
    );
    plane.rotation.set(-Math.PI/2, 0, 0);
    plane.name = name;
    return plane;
  }
  
  light(name = "TempLight") {
    const light = new THREE.DirectionalLight;
    light.position.set(-1, 3, 2);
    light.lookAt(0, 0, 0);
    light.name = name;
    return light;
  }

  axes() {
    const xAxis = this.axis("x", "#500", 1000);
    const zAxis = this.axis("z", "#005", 1000);
    const group = (new THREE.Group).add(xAxis, zAxis);
    group.name = "Axes";
    return group;    
  }

  axis(type, color, length) {
    const points = [new THREE.Vector3, new THREE.Vector3];
    [points[0][type], points[1][type]] = [-length/2, length/2];
    const geometry = (new THREE.BufferGeometry).setFromPoints(points);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, opacity: 1, linewidth: 1 }));
    line.name = `${type}Axis`;
    return line; 
  }

  grid(input = {}) {
    const {
      color, size1, size2, distance, axes,
    } = {
      color: input.color || new THREE.Color("#333"),
      size1: input.size1 || 0.2,
      size2: input.size2 || 1,
      distance: input.distance || 8000,
      axes: input.axes || "xzy",
    };
  
    const planeAxes = axes.substr( 0, 2 );
    const geometry = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
  
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uSize1: { value: size1 },
        uSize2: { value: size2 },
        uColor: { value: color },
        uDistance: { value: distance }
      },
      transparent: true,
  
      vertexShader: `
          varying vec3 worldPosition;
          uniform float uDistance;
          
          void main() {
                vec3 pos = position.${axes} * uDistance;
                pos.${planeAxes} += cameraPosition.${planeAxes};
                worldPosition = pos;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
      `,
  
      fragmentShader: `
          varying vec3 worldPosition;
          
          uniform float uSize1;
          uniform float uSize2;
          uniform vec3 uColor;
          uniform float uDistance;
            
          float getGrid(float size) {
            vec2 r = worldPosition.${planeAxes} / size;
            vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
            float line = min(grid.x, grid.y);
            return 1.0 - min(line, 1.0);
          }
            
          void main() {
            // float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
            float d = 1.0 - 0.25;
            float g1 = getGrid(uSize1);
            float g2 = getGrid(uSize2);
            gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
            gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
            if ( gl_FragColor.a <= 0.0 ) discard;
          }
      `,
  
      extensions: {
        derivatives: true
      }
  
    } );
  
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
  
    return mesh;
  }

}
