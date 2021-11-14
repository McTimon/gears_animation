import * as THREE from './three.module.js';
import { leftGearPoints,rightGearPoints,GearGenerator } from "./GearGenerator.js";
import { BufferGeometryUtils } from './BufferGeometryUtils__m.js';
import { OrbitControls } from './OrbitControls2.js';
import { Curve, TetrahedronGeometry } from "./three.module.js";
import {BespokeGeo} from "./BespokeGeo2.js"

import { HDRCubeTextureLoader } from './HDRCubeTextureLoader.js';
import { RGBMLoader } from './RGBMLoader.js';
import { DebugEnvironment } from './DebugEnvironment.js';


let camera;
let rearTeethCount = 42;
let rearTeethSet = [30,25,20,15,10,5];
let frontTeethSet = [40,"None"];
let paddleTeethCount = 100;
let container, stats;
// let camera, scene, renderer, controls;
let torusMesh, planeMesh;
let generatedCubeRenderTarget, ldrCubeRenderTarget, hdrCubeRenderTarget, rgbmCubeRenderTarget;
let ldrCubeMap, hdrCubeMap, rgbmCubeMap;
// let sprocketOne, sprocketTwo, sprocketThree, sprocketFour, sprocketFive;
let timeCustom = 0;

let toothedGears = [];

function main(rearTeethSetArray,frontTeethSetArray,activeRearGear,activeFrontGear){
toothedGears = [];
rearTeethSet = rearTeethSetArray;
frontTeethSet = frontTeethSetArray
const canvas = document.querySelector('#c');
////////////////
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;

renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
/////////////////
camera = new THREE.PerspectiveCamera( 40, (0.78* window.innerWidth) / window.innerHeight, 0.1, 1000 );
camera.position.set( - 1.1, 1.9, 20.5 );
// camera.position.set(8, 5, 12.2).multiplyScalar(4);
camera.position.set(-1.8, 2, 2.2).multiplyScalar(4);
camera.lookAt(1.8,3.5,2);
// camera.lookAt(10,10,10);
// camera.lookAt(1.8,3.5,2);

const texture = new THREE.TextureLoader().load( 'textures/equirectangular/royal_esplanade_1k.hdr' );

////////////////////
const materialX2 = new THREE.MeshStandardMaterial( { 
    color: 0x777777,
	metalness: 0.85,
	roughness: 0.2
} );
const materialX3 = new THREE.MeshStandardMaterial( { 
    color: 0xbb8933,
    // color: 0x996622,
	metalness: 0.9,
	roughness: 0.25
} );
THREE.DefaultLoadingManager.onLoad = function ( ) {
    pmremGenerator.dispose();
};

const hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ];
				hdrCubeMap = new HDRCubeTextureLoader()
					.setPath( './textures/cube/pisaHDR/' )
					.setDataType( THREE.UnsignedByteType )
					.load( hdrUrls, function () {

						hdrCubeRenderTarget = pmremGenerator.fromCubemap( hdrCubeMap );

						hdrCubeMap.magFilter = THREE.LinearFilter;
						hdrCubeMap.needsUpdate = true;

					} );

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileCubemapShader();
    
const envScene = new DebugEnvironment();
generatedCubeRenderTarget = pmremGenerator.fromScene( envScene );
    
renderer.outputEncoding = THREE.sRGBEncoding;

/////////////////////////////
const scene = new THREE.Scene();
scene.environment = texture;

{
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0,20,0);
    // scene.add(light);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.bias = 0.001;
}

{
    const light2 = new THREE.DirectionalLight(0xccffff, 0.81);
    light2.position.set(1,2,15);
    scene.add(light2);
}

const carWidth = GearGenerator.carWidth;
const carHeight = GearGenerator.carHeight;
const carLength = GearGenerator.carLength;

const chainLink = new THREE.Object3D();
scene.add(chainLink);

const bodyGeometry = new THREE.BoxBufferGeometry(carWidth, carHeight, carLength);
const bodyMaterial = new THREE.MeshStandardMaterial(
    {color: 0xeecc00,metalness:0.6,roughness:0.05}
);
const bodyMesh = new THREE.Mesh(bodyGeometry, materialX3);
// const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
bodyMesh.position.y = 0;
// bodyMesh.position.y = 1.4;
bodyMesh.castShadow = true;
chainLink.add(bodyMesh);

const wheelRadius = GearGenerator.wheelRadius;
const wheelThickness = GearGenerator.wheelThickness;
const wheelSegments = GearGenerator.wheelSegments;
const wheelGeometry = new THREE.CylinderBufferGeometry(
    wheelRadius, //top rad
    wheelRadius, //bottom rad
    wheelThickness,
    wheelSegments

);
const wheelMaterial = new THREE.MeshStandardMaterial(
    {color: 0xffdd66,metalness:0.5,roughness:0.05}
);
const wheelPositions = [
    [-carWidth/2 - wheelThickness/2, - 0*carHeight/2, 0],
    [carWidth/2 + wheelThickness/2, - 0*carHeight/2, 0],
];

/*const wheelMeshes =*/ wheelPositions.map((position) => {
    let mesh = new THREE.Mesh(wheelGeometry, materialX3);
    // let mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    mesh.position.set(...position);
    mesh.rotation.z = Math.PI/2;
    mesh.castShadow =  true;
    bodyMesh.add(mesh);
    return mesh;
});

let radiusL = GearGenerator.radius(rearTeethSetArray[activeRearGear]);//RL
let radiusR = GearGenerator.radius(frontTeethSetArray[activeFrontGear]);//Rr

let sprocketCentreHeight = Math.max(radiusL,radiusR)+wheelRadius*1.5;
const sprocketCentreInterval= GearGenerator.sprocketCentreInterval;  //d


let extrudeSettings;
// let material;
let sprocketToothed;
for(let j = 0;j < rearTeethSetArray.length; j++){ 
sprocketToothed = BespokeGeo.sprocket(rearTeethSet[j],0,sprocketCentreHeight,-carWidth/4 + j*GearGenerator.rearSprocketZSpacing);

toothedGears.push(sprocketToothed);
scene.add(sprocketToothed);


extrudeSettings = GearGenerator.extrudeSettings;


// material = new THREE.MeshStandardMaterial( { color: 0x848080,roughness:0.05, metalness: 0} );

}//end of rear sprocket set 'for loop'


for(let j = 0; j<frontTeethSetArray.length;j++){
sprocketToothed = BespokeGeo.sprocket(frontTeethSetArray[(frontTeethSetArray.length-j-1)],GearGenerator.sprocketCentreInterval,sprocketCentreHeight,-carWidth/4 + (-frontTeethSetArray.length+1 + j)*GearGenerator.rearSprocketZSpacing - GearGenerator.rightSprocketCentreZOffset);

toothedGears.push(sprocketToothed);

scene.add(sprocketToothed);
}




let noOfLinks = GearGenerator.noOfLinks;
let linkMeshes = [];

for(let i = 0; i<noOfLinks;i++){
    linkMeshes.push(chainLink.clone());
    scene.add(linkMeshes[i]);
}

bodyMesh.position.y = 200;
const arrayGenPoint = [];

const aMax = Math.atan((radiusR-radiusL)/sprocketCentreInterval);
const curveResolution = 15;//number of curve "handles"
let interval = (Math.PI-2*aMax)/(curveResolution/2); //angle interval for arcs during spline generation
let aRanger = aMax;
let chainTheta = 0;
let xPoint = 0;
let yPoint = 0;
let zPoint = 0;

////chain points
//smaller sprocker half points
for (let i = 0; i < (curveResolution/2); i++){
    
    chainTheta = Math.PI/2 + aRanger + interval*i;
    xPoint = radiusL*Math.cos(chainTheta);
    yPoint = -1 * radiusL*Math.sin(chainTheta) - sprocketCentreHeight;
    zPoint = GearGenerator.rearSprocketZSpacing*activeRearGear;

    arrayGenPoint.push(new THREE.Vector3(xPoint,zPoint,yPoint));//append
}

chainTheta = 0;
interval = (Math.PI+2*aMax)/(curveResolution/2); 
aRanger = Math.PI/2 - aMax;

//larger sprocker half points
for (let j = 0; j < (curveResolution/2); j++){
    chainTheta = Math.PI + aRanger + interval*(j);
    xPoint = sprocketCentreInterval + radiusR*Math.cos(chainTheta);
    // yPoint = 0-carWidth/4 + (-frontTeethSetArray.length+1 + activeFrontGear)*GearGenerator.rearSprocketZSpacing - GearGenerator.rightSprocketCentreZOffset;
    yPoint = -1*radiusR*Math.sin(chainTheta) - sprocketCentreHeight;

    arrayGenPoint.push(new THREE.Vector3(xPoint,
        // 0-GearGenerator.rightSprocketCentreZOffset + GearGenerator.rearSprocketZSpacing*activeRearGear,
        1*(/*-carWidth/4 +*/(/*-frontTeethSetArray.length+1 +*/ -activeFrontGear)*GearGenerator.rearSprocketZSpacing - GearGenerator.rightSprocketCentreZOffset),
        // 0-carWidth/4 + (-frontTeethSetArray.length+1 + activeFrontGear)*GearGenerator.rearSprocketZSpacing - GearGenerator.rightSprocketCentreZOffset,
        yPoint));//append
}

arrayGenPoint.push(arrayGenPoint[0]);//append

const chainCurve = new THREE.CatmullRomCurve3(arrayGenPoint);

const chainPoints = chainCurve.getPoints(curveResolution);
const chainGeometry = new THREE.BufferGeometry().setFromPoints(chainPoints);
const chainMaterial = new THREE.LineBasicMaterial({color:0xff0000});
const chainSplineObject =  new THREE.Line(chainGeometry, chainMaterial);
chainSplineObject.rotation.x = Math.PI * .5;
chainSplineObject.position.y = 0.05;
// scene.add(chainSplineObject);

////Resize canvas according to window size
function resizeRendererToDisplaySize(renderer){
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
        renderer.setSize(width*2.2, height*2.2, false);
    }
    return needResize
}

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.addEventListener( 'change', render ); // use if there is no animation loop
// controls.minDistance = 2;
// controls.maxDistance = 1000;
// controls.target.set( 0.1, 0.1, 0.2 );
// controls.update();

function render(time) {

    let renderTarget, cubeMap;
    renderTarget = hdrCubeRenderTarget;
	cubeMap = hdrCubeMap;
        
    time *= 0.001;

    if(resizeRendererToDisplaySize(renderer)){
        const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
    }


    let tankXPosition = new THREE.Vector3();
    let tankXTarget = new THREE.Vector3();

    //move tank
    let speed2 = 134/noOfLinks;
    for(let k = 0;k<noOfLinks;k++){
    let tankXTime = ((time + k*0.15*speed2) * .05);
    chainCurve.getPointAt(tankXTime % 1, tankXPosition);
    chainCurve.getPointAt((tankXTime + 0.01) % 1, tankXTarget);
    linkMeshes[k].position.set(tankXPosition.x, tankXPosition.z * -1, tankXPosition.y);
    chainLink.rotation.x=Math.PI;
    linkMeshes[k].lookAt(tankXTarget.x, tankXTarget.z *-1, tankXTarget.y);
    }

    const newEnvMap = renderTarget ? renderTarget.texture : null;
    //rotate sprockets
    for(let i = 0; i < toothedGears.length;i++){
        // toothedGears[i].rotation.y = 0.0065*speed2;

        toothedGears[i].rotation.y = 0.39*speed2*time;
        toothedGears[i].material = materialX2;
        toothedGears[i].material.envMap = newEnvMap;
        toothedGears[i].material.needsUpdate = true;
        materialX3.envMap = newEnvMap;
    }
    
    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', render ); // use if there is no animation loop
    // controls.minDistance = 2;
    // controls.maxDistance = 1000;
    // controls.target.set( 0.1, 0.1, 0.2 );
    // controls.update();
    // scene.background = cubeMap;

    renderer.toneMappingExposure = 2.312;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
    }

    requestAnimationFrame(render);



}

// main(42,105);
// main();

function getTeethCount(rearTeethCount,paddleTeethCount){

    //remove "None" strings, change to number
    let rearTeethCorrected = [];
    let frontTeethCorrected = [];
    for(let i=0;i<rearTeethCount.length;i++){
        if(rearTeethCount[i]=="None"){}
        else{
             rearTeethCorrected.push(parseInt(rearTeethCount[i]));
        }
    }
    for(let i=0;i<paddleTeethCount.length;i++){
        if(paddleTeethCount[i]=="None"){}
        else{
            frontTeethCorrected.push(parseInt(paddleTeethCount[i]));
        }
    }

    // console.log(rearTeethCorrected);
    // console.log(frontTeethCorrected);


    main(rearTeethCorrected,frontTeethCorrected,0,0);



}

function setActiveRearGear(activeRearGear,activeFrontGear){
    timeCustom = 0;
    main(rearTeethSet,frontTeethSet,activeRearGear,activeFrontGear);
}

// getTeethCount(45,100);
getTeethCount(["30","25","20","16","8"],["40","30", "20","10","8"]);

window.getTeethCount = getTeethCount;
window.setActiveRearGear = setActiveRearGear;