// import * as THREE from './three.module.js';
// import { leftGearPoints,rightGearPoints,GearGenerator } from "./GearGenerator.js";
// import { OrbitControls } from './OrbitControls.js';
// import { Curve, TetrahedronGeometry } from "./three.module.js";


// let camera;
// function main(rearTeethCount,paddleTeethCount){

// const canvas = document.querySelector('#c');
// const renderer = new THREE.WebGLRenderer({canvas: canvas});
// renderer.setClearColor(0xAAAAAA);
// renderer.shadowMap.enabled = true;

// camera = new THREE.PerspectiveCamera( 40, (0.78* window.innerWidth) / window.innerHeight, 0.1, 1000 );
// camera.position.set( - 1.1, 1.9, 20.5 );
// camera.position.set(-8, 18, 12).multiplyScalar(3);
// camera.lookAt(7,10,2);


// const scene = new THREE.Scene();

// {
//     const light = new THREE.DirectionalLight(0xffffff, 1);
//     light.position.set(0,20,0);
//     scene.add(light);
//     light.castShadow = true;
//     light.shadow.mapSize.width = 2048;
//     light.shadow.mapSize.height = 2048;

//     const d = 50;
//     light.shadow.camera.left = -d;
//     light.shadow.camera.right = d;
//     light.shadow.camera.top = d;
//     light.shadow.camera.bottom = -d;
//     light.shadow.camera.near = 1;
//     light.shadow.camera.far = 50;
//     light.shadow.bias = 0.001;
// }

// {
//     const light = new THREE.DirectionalLight(0xffffff, 1);
//     light.position.set(1,2,4);
//     scene.add(light);
// }

// const groundGeometry = new THREE.PlaneBufferGeometry(50, 50);
// const groundMaterial = new THREE.MeshPhongMaterial({color: 0xCC8866});
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.rotation.x = Math.PI * -.5;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);

// const carWidth = GearGenerator.carWidth
// const carHeight = GearGenerator.carHeight;
// const carLength = GearGenerator.carLength;

// const tank = new THREE.Object3D();
// // scene.add(tank);

// const bodyGeometry = new THREE.BoxBufferGeometry(carWidth, carHeight, carLength);
// const bodyMaterial = new THREE.MeshPhongMaterial({color: 0x6688AA});
// const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
// bodyMesh.position.y = 0;
// // bodyMesh.position.y = 1.4;
// bodyMesh.castShadow = true;
// tank.add(bodyMesh);

// const wheelRadius = GearGenerator.wheelRadius;
// const wheelThickness = GearGenerator.wheelThickness;
// const wheelSegments = GearGenerator.wheelSegments;
// const wheelGeometry = new THREE.CylinderBufferGeometry(
//     wheelRadius, //top rad
//     wheelRadius, //bottom rad
//     wheelThickness,
//     wheelSegments

// );
// const wheelMaterial = new THREE.MeshPhongMaterial(
//     {color: 0x888888}
// );
// const wheelPositions = [
//     [-carWidth/2 - wheelThickness/2, - 0*carHeight/2, 0],
//     [carWidth/2 + wheelThickness/2, - 0*carHeight/2, 0],
// ];

// /*const wheelMeshes =*/ wheelPositions.map((position) => {
//     let mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
//     mesh.position.set(...position);
//     mesh.rotation.z = Math.PI/2;
//     mesh.castShadow =  true;
//     bodyMesh.add(mesh);
//     return mesh;
// });

// // let leftGearTeeth = GearGenerator.leftTeethCount;
// // let rightGearTeeth = GearGenerator.rightTeethCount;
// let leftGearTeeth = rearTeethCount;
// let rightGearTeeth = paddleTeethCount;
// let radiusL = GearGenerator.radius(leftGearTeeth);//RL
// let radiusR = GearGenerator.radius(rightGearTeeth);//Rr
// const sprocketCentreInterval= GearGenerator.sprocketCentreInterval;  //d

// let shape = new THREE.Shape();

// //small gear (Left) from circle
// let gearParams = [];
// gearParams=leftGearPoints(leftGearTeeth,0,0,0,radiusR);
// shape.moveTo(gearParams[0][2],gearParams[0][3]);

// for (let i = 1; i < gearParams.length; i++){
//     shape.quadraticCurveTo(
//         ...gearParams[i]
//         );
// }

// const extrudeSettings = GearGenerator.extrudeSettings;

// let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
// const material = new THREE.MeshPhongMaterial( { color: 0x887755 } );
// let mesh = new THREE.Mesh( geometry, material ) ;
// mesh.position.z = -carWidth/4;
// scene.add( mesh );

// //test large gear (Right) from circle
// shape = new THREE.Shape();
// gearParams = [];
// gearParams=rightGearPoints(rightGearTeeth,0,0,0,radiusR);
// shape.moveTo(gearParams[0][2],gearParams[0][3]);

// for (let i = 1; i < gearParams.length; i++){
//     shape.quadraticCurveTo(
//         ...gearParams[i]
//         );
// }

// geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
// mesh = new THREE.Mesh( geometry, material ) ;
// mesh.position.z = -carWidth/4;
// scene.add( mesh );

// let noOfLinks = GearGenerator.noOfLinks;
// let linkMeshes = [];

// for(let i = 0; i<noOfLinks;i++){
//     linkMeshes.push(tank.clone());
//     scene.add(linkMeshes[i]);
// }

// const arrayGenPoint = [];

// const aMax = Math.atan((radiusR-radiusL)/sprocketCentreInterval);
// const curveResolution = 15;//number of curve "handles"
// let interval = (Math.PI-2*aMax)/(curveResolution/2); //angle interval for arcs during spline generation
// let aRanger = aMax;
// let chainTheta = 0;
// let xPoint = 0;
// let yPoint = 0;

// ////chain points
// //smaller sprocker half points
// for (let i = 0; i < (curveResolution/2); i++){
    
//     chainTheta = Math.PI/2 + aRanger + interval*i;
//     xPoint = radiusL*Math.cos(chainTheta);
//     yPoint = -1 * radiusL*Math.sin(chainTheta) - radiusR;

//     arrayGenPoint.push(new THREE.Vector3(xPoint,0,yPoint));//append
// }

// chainTheta = 0;
// interval = (Math.PI+2*aMax)/(curveResolution/2); 
// aRanger = Math.PI/2 - aMax;

// //larger sprocker half points
// for (let j = 0; j < (curveResolution/2); j++){
//     chainTheta = Math.PI + aRanger + interval*(j);
//     xPoint = sprocketCentreInterval + radiusR*Math.cos(chainTheta);
//     yPoint = -1*radiusR*Math.sin(chainTheta) - radiusR;

//     arrayGenPoint.push(new THREE.Vector3(xPoint,0,yPoint));//append
// }

// arrayGenPoint.push(arrayGenPoint[0]);//append

// const chainCurve = new THREE.CatmullRomCurve3(arrayGenPoint);

// const chainPoints = chainCurve.getPoints(curveResolution);
// const chainGeometry = new THREE.BufferGeometry().setFromPoints(chainPoints);
// const chainMaterial = new THREE.LineBasicMaterial({color:0xff0000});
// const chainSplineObject =  new THREE.Line(chainGeometry, chainMaterial);
// chainSplineObject.rotation.x = Math.PI * .5;
// chainSplineObject.position.y = 0.05;
// // scene.add(chainSplineObject);

// ////Resize canvas according to window size
// function resizeRendererToDisplaySize(renderer){
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if(needResize){
//         renderer.setSize(width, height, false);
//     }
//     return needResize
// }


// function render(time) {
        
//     time *= 0.001;

//     if(resizeRendererToDisplaySize(renderer)){
//         const canvas = renderer.domElement;
//             camera.aspect = canvas.clientWidth / canvas.clientHeight;
//             camera.updateProjectionMatrix();
//     }


//     let tankXPosition = new THREE.Vector3();
//     let tankXTarget = new THREE.Vector3();

//     //move tank
//     for(let k = 0;k<noOfLinks;k++){
//     let tankXTime = ((time + k*0.15) * .05);
//     chainCurve.getPointAt(tankXTime % 1, tankXPosition);
//     chainCurve.getPointAt((tankXTime + 0.01) % 1, tankXTarget);
//     linkMeshes[k].position.set(tankXPosition.x, tankXPosition.z * -1, tankXPosition.y);
//     tank.rotation.x=Math.PI;
//     linkMeshes[k].lookAt(tankXTarget.x, tankXTarget.z *-1, tankXTarget.y);
//     }
    
//     // const controls = new OrbitControls( camera, renderer.domElement );
//     // controls.addEventListener( 'change', render ); // use if there is no animation loop
//     // controls.minDistance = 2;
//     // controls.maxDistance = 1000;
//     // controls.target.set( 0.1, 0.1, 0.2 );
//     // controls.update();

//     renderer.render(scene, camera);

//     requestAnimationFrame(render);
//     }

//     requestAnimationFrame(render);



// }

// // main(42,105);

// function getTeethCount(rearTeethCount,paddleTeethCount){
//     main(rearTeethCount,paddleTeethCount);
// }

// //getTeethCount(42,105);



console.log("hello to the world");
let latitude_main = 0;
let longitude_main = 0;

//app upload page: "Power-Cut tracker" -find out from others around you if there has been a powercut, and also find out where there's electricity
//"Electricity finder" ?

// var map = L.map('mapid').setView([latitude_main, longitude_main], 13);
////L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// L.marker([51.5, -0.09]).addTo(map)
//     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//     .openPopup();
// getCoords(0.0,0.0);
var getCoords = function(latitude, longitude){
    latitude_main = latitude;
    longitude_main = longitude;

    var map = L.map('mapid').setView([latitude_main, longitude_main], 13);
// var map = L.map('mapid').setView([5.700, -0.2], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}

window.getCoords = getCoords;