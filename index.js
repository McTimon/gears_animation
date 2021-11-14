import * as THREE from './three.module.js';
import {OrbitControls} from './OrbitControls.js';
import {Logging} from './Logging.js';
import {ProcessKeyPress} from './ProcessKeyPress.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 40;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(20, 20, 50);
  camera.up.set(0,1,0);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(10,50,25);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 0.5;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  var keyTracker = new ProcessKeyPress();
  keyTracker.action(scene);

  // an array of objects who's rotation to update
  const objects = [];

  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);

  const grid = new THREE.GridHelper(100, 100);
  grid.material.depthTest = true;
  grid.renderOrder = 1;
  solarSystem.add(grid);

  const gridLarger = new THREE.GridHelper(10, 10);
  gridLarger.material.depthTest = true;
  gridLarger.renderOrder = 1;
  gridLarger.scale.set(10,10,10);
  gridLarger.position.set(0.051,0.051,0.051);
  solarSystem.add(gridLarger);

  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new THREE.SphereBufferGeometry(
      radius, widthSegments, heightSegments);

  const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0x999900});
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  // sunMesh.scale.set(0.5, 0.5, 0.5);
  sunMesh.scale.set(5, 5, 5);
  scene.add(sunMesh);
  objects.push(sunMesh);

  const planetMaterial = new THREE.MeshPhongMaterial();
  const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
  // sunMesh.scale.set(0.5, 0.5, 0.5);
  planetMesh.scale.set(0.5, 0.5, 0.5);
  planetMesh.position.set(2,0,2);
  sunMesh.add(planetMesh);
  objects.push(planetMesh);

//   function makeAxisGrid(node, label, units){
//     const helper = new AxisGridHelper(node, units);
    // gui.add(helper, 'visible').name(label);
// }

// makeAxisGrid(solarSystem, 'solarSystem', 25);
// makeAxisGrid(sunMesh, 'sunMesh');
// makeAxisGrid(earthOrbit, 'earthOrbit');
// makeAxisGrid(earthMesh, 'earthMesh');
// makeAxisGrid(moonOrbit, 'moonOrbit');
// makeAxisGrid(moonMesh, 'moonMesh');

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj) => {
      obj.rotation.y = time;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
