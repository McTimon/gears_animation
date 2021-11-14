/*

backup for when gears spun "the other way"

*/

import * as THREE from './three.module.js';
import { leftGearPoints,rightGearPoints,GearGenerator } from "./GearGenerator.js";
import { BufferGeometryUtils } from './BufferGeometryUtils__m.js';
import { OrbitControls } from './OrbitControls2.js';
import { Curve, TetrahedronGeometry } from "./three.module.js";
import {BespokeGeo} from "./BespokeGeo2.js"
import { RGBELoader } from './RGBELoader.js';
import { GLTFLoader } from './GLTFLoader.js';

import { HDRCubeTextureLoader } from './HDRCubeTextureLoader.js';
import { RGBMLoader } from './RGBMLoader.js';
import { DebugEnvironment } from './DebugEnvironment.js';
import { ChainAnimGenerator } from './chainAnimGenerator.js';

import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { SAOPass } from './SAOPass.js';
import { SSAOPass } from './SSAOPass.js';


let composer, renderPass, ssaoPass, saoPass;
let group;

//divide all real world dimms by 75 for accuracy
let camera, scene, rendererNew;
let oldRGBELoader;
let envMap;

let linkMeshes;

let chainCurve, chordLengthApprox, chordLengthTrue, chainPoints, chainGeometry,chainMaterial, chainSplineObject, chainPiecesSet;

let frontAngleOffset = 0;
let rearAngleOffset = 0;
let hasFrontAngleOffset = false;
let hasRearAngleOffset = false;

let angularSpeedRear;
let angularSpeedChord;
let angularSpeedFront;

let radiusL;// = GearGenerator.radius(rearTeethSetArray[activeRearGear]);//RL
let radiusR;// = GearGenerator.radius(frontTeethSetArray[activeFrontGear]);//Rr

let frontSprocketZShift = 0; 
let adjustedSprocketCentreInterval =GearGenerator.sprocketCentreInterval;

let oldControlsTarget = {x:adjustedSprocketCentreInterval/2,y:0,z:0};
let oldControlsPosition = {x:adjustedSprocketCentreInterval/2,y:0,z:10};
let rearTeethSet = [30,25,20,15,10,5];

let frontTeethSet = [40,"None"];
let container;
let bearingMesh, pivotMesh, slateMesh, slateMeshIn;
let bearingMat, pivotMat, slateMat, slateInMat;

let bearingLinkMeshes = [];
let pivotLinkMeshes = [];
let slateLinkMeshes = [];
let slateInLinkMeshes = [];

let isFirstCameraSetup = true;
let isFirstRun = true;

let noOfLinksGlobal = GearGenerator.noOfLinks;
let noOfLinksOld = GearGenerator.noOfLinks;

let rearToothedGears = [];
let frontToothedGears = [];
let activeFrontGearGlobal, activeRearGearGlobal;
let fullChainLength;

function init(rearTeethSetArray,frontTeethSetArray,activeRearGear,activeFrontGear, meshGenCallback){
    let chainParams = ChainAnimGenerator.points(rearTeethSetArray,activeRearGear,frontTeethSetArray,activeFrontGear);
    noOfLinksGlobal = chainParams[4];
    fullChainLength = chainParams[0];
    frontSprocketZShift = -0.5*((rearTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing+(frontTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing);
    activeRearGearGlobal = activeRearGear;
    activeFrontGearGlobal = activeFrontGear;
    angularSpeedRear = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGear];
    angularSpeedFront = GearGenerator.fiftyTwoAngularVelocity/frontTeethSetArray[activeFrontGear];
    angularSpeedChord = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGearGlobal];
    
    frontToothedGears = [];
    rearToothedGears = [];
    rearTeethSet = rearTeethSetArray;
    frontTeethSet = frontTeethSetArray;

    let chainParamsArray = ChainAnimGenerator.points(rearTeethSetArray,activeRearGear,frontTeethSetArray,activeFrontGear);
    container = document.querySelector("#canvas_root");
    const canvas = document.querySelector('#c');
    rendererNew = new THREE.WebGLRenderer({ canvas, antialias: true, alpha:true});
    rendererNew.setClearColor(0x000000);
    rendererNew.shadowMap.enabled = true;
    
    rendererNew.physicallyCorrectLights = true;
    rendererNew.toneMapping = THREE.ACESFilmicToneMapping;

    camera = new THREE.PerspectiveCamera( 40, (0.78* window.innerWidth) / window.innerHeight, 0.1, 1000 );

function positionCameraToWindowSize(width, height){
    let xPos = 0;
    let yPos = 0;
    let zPos = 0;


}
camera.position.set(oldControlsPosition.x, oldControlsPosition.y, oldControlsPosition.z);

////////////////////
const materialX2 = new THREE.MeshStandardMaterial( { //sprocket metal
    color: 0x666666,
	metalness: 1,
	roughness: 0.2*1.2
} );
const materialX3 = new THREE.MeshStandardMaterial( { //chain metal
    color: 0xbb8933,
	metalness: 0.8*0,
	roughness: 0.3
} );

let envMap;
 new RGBELoader()
.setDataType( THREE.UnsignedByteType )
.setPath( 'textures/equirectangular/' )
.load( 'royal_esplanade_1k.hdr', function ( texture ) {

    envMap = pmremGenerator.fromEquirectangular( texture ).texture;

    scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();

    } );



    const bearingLoader = new GLTFLoader().setPath( 'models/' );
    bearingLoader.load( 'split_meshes.gltf', function ( gltf ) {

        gltf.scene.traverse( function ( child ) {

            if ( child.isMesh ) {
                const chainScale = 0.1833*chordLengthTrue/chordLengthApprox;  //these vars are undefined at this line but work due to async delay from gltf loader                   
                // const chainScale = 0.77188*chordLengthOld/chordLength;                     
                // const chainScale = 0.185;                     
                // console.log(chordLength); 
                // const chainScale = 0.25;  
                switch(child.name){


                    case 'bearing_LP001':
                        bearingMesh = child;
                        bearingMat = child.material;
                        bearingMat.color.set(0x181818);
                        bearingMat.roughness = 0.4;
                        bearingMat.metalness = 1;
                        bearingMesh.scale.set(chainScale,chainScale,chainScale);
                        break;                 
                    case 'pivot_LP001':
                        pivotMesh = child;
                        pivotMat = child.material;
                        pivotMat.color.set(0x333333);
                        pivotMat.roughness = 0.5;
                        pivotMat.metalness = 1;
                        pivotMesh.scale.set(chainScale/1.3,chainScale,chainScale);
                        break;
                    case 'slate_LP001':
                        slateMesh = child;
                        slateMat = child.material;
                        slateMat.color.set(0x775324);
                        slateMat.roughness = 0.25;//0.3;
                        slateMat.metalness = 0.9;
                        slateMesh.scale.set(chainScale*2,chainScale,chainScale);
                        break;
                    case 'slate_LPin001':
                        slateMeshIn = child;
                        slateInMat = child.material;
                        slateInMat = child.material;
                        slateInMat.color.set(0x553210);
                        slateInMat.roughness = 0.25;
                        slateInMat.metalness = 0.9;
                        slateMeshIn.position.z = 0.5;
                        slateMeshIn.scale.set(chainScale*2,chainScale,chainScale);
                        break;
                }
            }

        } );

        bearingLinkMeshes = meshGenCallback(noOfLinksGlobal, bearingMesh);
        pivotLinkMeshes = meshGenCallback(noOfLinksGlobal, pivotMesh);
        slateLinkMeshes = meshGenCallback(noOfLinksGlobal, slateMesh);
        slateInLinkMeshes = meshGenCallback(noOfLinksGlobal, slateMeshIn);
        chainPiecesSet = [bearingLinkMeshes,pivotLinkMeshes,slateLinkMeshes,slateInLinkMeshes];

    } );


    rendererNew.toneMapping = THREE.ACESFilmicToneMapping;
    rendererNew.outputEncoding = THREE.sRGBEncoding;

    const pmremGenerator = new THREE.PMREMGenerator( rendererNew );
    pmremGenerator.compileEquirectangularShader();
    
    rendererNew.outputEncoding = THREE.sRGBEncoding;

    scene = new THREE.Scene();

{
    const light = new THREE.DirectionalLight(0xffddff, 0.5);//back left-ish
    light.position.set(-3,2,-5);
    scene.add(light);
    light.castShadow = false;
    // light.shadow.mapSize.width = 2048;
    // light.shadow.mapSize.height = 2048;

    // const d = 50;
    // light.shadow.camera.left = -d;
    // light.shadow.camera.right = d;
    // light.shadow.camera.top = d;
    // light.shadow.camera.bottom = -d;
    // light.shadow.camera.near = 1;
    // light.shadow.camera.far = 50;
    // light.shadow.bias = 0.001;
}


{
    const light2 = new THREE.DirectionalLight(0xccffff, 0.7); //front head on
    light2.position.set(1,2,15);
    scene.add(light2);
    light2.castShadow = false;
}

{
    const light5 = new THREE.DirectionalLight(0xccffff, 1);//back right
    light5.position.set(15,2,-15);
    scene.add(light5);
    light5.castShadow = false;
}

{
    const light4 = new THREE.DirectionalLight(0xccffff, 0.5);//back head on
    light4.position.set(1,2,-15);
    scene.add(light4);
    light4.castShadow = false;
}

{
    const light6 = new THREE.DirectionalLight(0xccffff, 1);//front right
    light6.position.set(15,2,15);
    scene.add(light6);
    light6.castShadow = false;
}

{
    const light7 = new THREE.DirectionalLight(0xccffff, 0.6);//front left
    light7.position.set(-15,2,15);
    scene.add(light7);
    light7.castShadow = false;
}

{
    const light8 = new THREE.DirectionalLight(0xccffff, 0.3);//back left
    light8.position.set(-15,2,-15);
    scene.add(light8);
    light8.castShadow = false;
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
bodyMesh.position.y = 0;
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

    wheelPositions.map((position) => {
    let mesh = new THREE.Mesh(wheelGeometry, materialX3);
     mesh.position.set(...position);
    mesh.rotation.z = Math.PI/2;
    mesh.castShadow =  true;
    bodyMesh.add(mesh);
    return mesh;
});

radiusL = GearGenerator.radius(rearTeethSetArray[activeRearGear]);//RL
radiusR = GearGenerator.radius(frontTeethSetArray[activeFrontGear]);//Rr



let maxTeethCount = 0;

for(let i = 0; i < rearTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,rearTeethSet[i])
}

for(let i = 0; i < frontTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,frontTeethSet[i]);
}

let sprocketCentreHeight = GearGenerator.radius(maxTeethCount)+wheelRadius*1.5;
if(isFirstCameraSetup){
    let extension = 0.2;
oldControlsTarget = {x:( GearGenerator.sprocketCentreInterval+ radiusR - radiusL) /2 + extension,y:sprocketCentreHeight,z:0};
oldControlsPosition = {x:(GearGenerator.sprocketCentreInterval + radiusR - radiusL)/2 + extension,y:sprocketCentreHeight,z:20};
camera.position.set(oldControlsPosition.x,oldControlsPosition.y,oldControlsPosition.z);
isFirstCameraSetup = false;

}
let sprocketCentreInterval= GearGenerator.sprocketCentreInterval;  //d

let extrudeSettings;
let sprocketToothed;

for(let j = 0;j < rearTeethSetArray.length; j++){ 
sprocketToothed = BespokeGeo.sprocket(rearTeethSetArray[j],0,sprocketCentreHeight,-carWidth/4 + 2*j*GearGenerator.rearSprocketZSpacing);
rearToothedGears.push(sprocketToothed);
sprocketToothed.name="sprocket";
sprocketToothed.scale.set(1,GearGenerator.sprocketThicknessScale,1);
scene.add(sprocketToothed);


extrudeSettings = GearGenerator.extrudeSettings;

}//end of rear sprocket set 'for loop'


for(let j = 0; j<frontTeethSetArray.length;j++){
    sprocketToothed = BespokeGeo.sprocket(frontTeethSetArray[(frontTeethSetArray.length-j-1)],adjustedSprocketCentreInterval,sprocketCentreHeight,-carWidth/4 + (-frontTeethSetArray.length+1 + j)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift);
     frontToothedGears.push(sprocketToothed);
    sprocketToothed.name="sprocket";
    sprocketToothed.scale.set(1,GearGenerator.sprocketThicknessScale,1);
    scene.add(sprocketToothed);
    }//end of front sprocket 'for loop'

    linkMeshes = [];

bodyMesh.position.y = 200;

//const aMax = Math.atan((radiusR-radiusL)/sprocketCentreInterval);


composer = new EffectComposer( rendererNew );
renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
// ssaoPass = new SSAOPass( scene, camera, window.innerWidth, window.innerHeight );
// ssaoPass.kernelRadius = 8;
// ssaoPass.minDistance = 0.001 ;
// composer.addPass( ssaoPass );
// ssaoPass.maxDistance=  50;
// ssaoPass.output = SSAOPass.OUTPUT.SSAO;


//SAO settings
saoPass = new SAOPass( scene, camera, false, true );
saoPass.params.saoBias =  0.7;
saoPass.params.saoIntensity = 0.07*1.7;
saoPass.params.saoScale = 70;
saoPass.params.saoKernelRadius =32;
saoPass.params.saoMinResolution = 0;
saoPass.params.saoBlur = true;
saoPass.params.saoBlurRadius = 20;
saoPass.params.saoBlurStdDev = 2 ;
saoPass.params.saoBlurDepthCutoff = 0.01;
composer.addPass( saoPass );

// gui.add( saoPass.params, 'saoBias', - 1, 1 );
// gui.add( saoPass.params, 'saoIntensity', 0, 1 );
// gui.add( saoPass.params, 'saoScale', 0, 10 );
// gui.add( saoPass.params, 'saoKernelRadius', 1, 100 );
// gui.add( saoPass.params, 'saoMinResolution', 0, 1 );
// gui.add( saoPass.params, 'saoBlur' );
// gui.add( saoPass.params, 'saoBlurRadius', 0, 200 );
// gui.add( saoPass.params, 'saoBlurStdDev', 0.5, 150 );
// gui.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );

let arrayGenPoint = [];
const arrayGenPointL = [];
const arrayGenPointR = [];
const bottomGenPoints = [];
const topGenPoints = [];

const aMax = Math.atan((radiusR-radiusL)/sprocketCentreInterval);
const curveResolution = 100;//15;//number of curve "handles"
let interval = (Math.PI-2*aMax)/(curveResolution/2); //angle interval for arcs during spline generation
let aRanger = aMax;
let chainTheta = 0;
let xPoint = 0;
let yPoint = 0;
let zPoint = 0;

////chain points
//move chains out a bit
let chainExpandFactor = 1;
//smaller sprocker half points
for (let i = 0; i < (curveResolution/2); i++){
    
    chainTheta = Math.PI/2 + aRanger + interval*i;
    xPoint = radiusL*Math.cos(chainTheta);
    yPoint = radiusL*Math.sin(chainTheta) + sprocketCentreHeight;
    zPoint = -carWidth/4 + 2*activeRearGear*GearGenerator.rearSprocketZSpacing;
    
    arrayGenPointL.push(new THREE.Vector3(xPoint,yPoint,zPoint));//append
}



chainTheta = 0;
interval = (Math.PI+2*aMax)/(curveResolution/2); 
aRanger = Math.PI/2 - aMax;

let jtk =  - activeFrontGear;
//larger sprocker half points
for (let j = 0; j < (curveResolution/2); j++){
    chainTheta = Math.PI + aRanger + interval*(j);
    xPoint = sprocketCentreInterval + radiusR*Math.cos(chainTheta);
    yPoint = radiusR*Math.sin(chainTheta) + sprocketCentreHeight;
    zPoint = -carWidth/4 - (activeFrontGear)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift;

    arrayGenPointR.push(new THREE.Vector3(xPoint,yPoint,zPoint));//append
}
bottomGenPoints.push(arrayGenPointL[curveResolution/2 -1]);
topGenPoints.push(arrayGenPointR[curveResolution/2 -1]);
bottomGenPoints.push(arrayGenPointR[0]);
topGenPoints.push(arrayGenPointL[0]);

let bottomSlantHelper, topSlantHelper,chainCurveL,chainCurveR;

chainCurveL = new THREE.CatmullRomCurve3(arrayGenPointL);
chainCurveR = new THREE.CatmullRomCurve3(arrayGenPointR);
bottomSlantHelper = new THREE.CatmullRomCurve3(bottomGenPoints);
topSlantHelper = new THREE.CatmullRomCurve3(topGenPoints);

let chainPoints2 = chainCurveL.getSpacedPoints(curveResolution); //add LHS curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = bottomSlantHelper.getSpacedPoints(curveResolution); //add bottom curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = chainCurveR.getSpacedPoints(curveResolution);//add RHS curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = topSlantHelper.getSpacedPoints(curveResolution);//add top curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}

chainCurve = new THREE.CatmullRomCurve3(arrayGenPoint);
chordLengthTrue = 2*Math.PI*radiusL/rearTeethSetArray[activeRearGear];//2xPIxR/teethcount
noOfLinksGlobal = Math.round(0.5*chainCurve.getLength()/chordLengthTrue)*2;//force multiples of 2 (outer link inner link alternating)


chordLengthApprox= chainCurve.getLength()/noOfLinksGlobal;
angularSpeedChord = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGearGlobal];
angularSpeedRear *= chordLengthTrue/chordLengthApprox;
angularSpeedFront *= chordLengthTrue/chordLengthApprox; //scaling speed to give sprockets same period as looping links

// visualize spaced points 

// const sphereGeomtry = new THREE.SphereBufferGeometry( 0.1 );
// const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

// const spacedPoints = chainCurve.getPoints( 100 );

// for ( let point of spacedPoints ) {

// 	const helper = new THREE.Mesh( sphereGeomtry, sphereMaterial );
// 	helper.position.copy( point );
// 	scene.add( helper );

// }

function resizeRendererToDisplaySize(rendererNew){
    const canvas = rendererNew.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
        rendererNew.setSize(width*2.2, height*2.2, false);    
        composer.setSize( width*2.2, height*2.2 );
    }

    return needResize
}

const controls = new OrbitControls( camera, rendererNew.domElement );
// controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.minDistance = 2;
controls.maxDistance = 1000;
controls.target.set( oldControlsTarget.x, oldControlsTarget.y, oldControlsTarget.z);
controls.update();



function render(time) {
    oldControlsTarget = controls.target;
    oldControlsPosition = controls.object.position;

    time *= 0.001;

    if(resizeRendererToDisplaySize(rendererNew)){
        const canvas = rendererNew.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
    }


    let chainLinkVelocity = angularSpeedChord*radiusL;
    // console.log("AC" + angularSpeedChord);
    // console.log("AS" + angularSpeedRear);

    // console.log(noOfLinks2);
    let pivotPosition = new THREE.Vector3();
    let pivotTarget = new THREE.Vector3();
    // pivotPosition = {
    //     x:radiusL*Math.cos(angularSpeedRear*time),
    //     y:sprocketCentreHeight + radiusL*Math.sin(angularSpeedRear*time),
    //     z:0
    // }
    // console.log(fullChainLength);
    // console.log(chainCurve.getLength());

         // move chain ring
    if(bearingMesh && bearingLinkMeshes[noOfLinksGlobal-1]){
        //ChainAnimGenerator.moveChain(rearTeethSet,activeRearGearGlobal,frontTeethSet,activeFrontGearGlobal,chainPiecesSet,angularSpeedRear,angularSpeedFront,sprocketCentreHeight,frontSprocketZShift, time);
      for(let k = 0;k<noOfLinksGlobal;k++){
        let pivotCurveSection = (time*chainLinkVelocity/chainCurve.getLength() + k*chordLengthApprox/chainCurve.getLength()); //ratio of position along curve to total length (0 - 1)
        chainCurve.getPointAt(pivotCurveSection % 1, pivotPosition);
        if(Math.abs(pivotPosition.y - sprocketCentreHeight)<0.009 && !hasFrontAngleOffset){
            //use this to copy rotation once for front sprocket offset
            if(pivotPosition.x>0){
            frontAngleOffset = /*-1*/ 1 * angularSpeedFront * time;
            console.log("got it Front");
            hasFrontAngleOffset = true;
            }
        }
        if(Math.abs(pivotPosition.y - sprocketCentreHeight)<0.009 && !hasRearAngleOffset){
            //use this to copy rotation once for front sprocket offset
            if(pivotPosition.x<0){
            rearAngleOffset = /*-*/1 * angularSpeedRear * time + Math.PI;
            console.log("got it Rear");
            hasRearAngleOffset = true;
            }
        }
        chainCurve.getPointAt((pivotCurveSection + 1/noOfLinksGlobal) % 1, pivotTarget);
        bearingLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);
        bearingLinkMeshes[k].lookAt(pivotTarget.x, pivotTarget.y, pivotTarget.z);
        bearingLinkMeshes[k].visible = true;
        }
    }
      //move chain cylinder
      if(pivotMesh && pivotLinkMeshes[noOfLinksGlobal-1]){
        for(let k = 0;k<noOfLinksGlobal ;k++){
            let pivotCurveSection = (time*chainLinkVelocity/chainCurve.getLength() + k*chordLengthApprox/chainCurve.getLength()); //ratio of position along curve to total length (0 - 1)
            chainCurve.getPointAt(pivotCurveSection % 1, pivotPosition);
            chainCurve.getPointAt((pivotCurveSection + 0.01) % 1, pivotTarget);
            pivotLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);
            pivotLinkMeshes[k].lookAt(pivotTarget.x, pivotTarget.y, pivotTarget.z);
        pivotLinkMeshes[k].visible = true;
 }
      }
      
      //move chain flat outer link

      if(slateMesh && slateLinkMeshes[noOfLinksGlobal-1]){      
        ChainAnimGenerator.positionFlatLink(chainPiecesSet,sprocketCentreHeight);
        for(let k = 0;k<noOfLinksGlobal;k++){
            let pivotCurveSection = (time*chainLinkVelocity/chainCurve.getLength() + (0.5+2*(Math.floor(k/2)))*chordLengthApprox/chainCurve.getLength()); //ratio of position along curve to total length (0 - 1)
            // chainCurve.getPointAt(pivotCurveSection % 1, pivotPosition);
            // chainCurve.getPointAt((pivotCurveSection + 0.01) % 1, pivotTarget);
            // slateLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);
            // slateLinkMeshes[k].lookAt(pivotTarget.x, pivotTarget.y, pivotTarget.z);
            // slateLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z + ((2*(k%2))-1)*GearGenerator.chainLinkThicknessOuter/2); 
            slateLinkMeshes[k].visible = true;     
          }
      }

      //move chain flat inner link
      if(slateMeshIn && slateInLinkMeshes[noOfLinksGlobal-1]){
      for(let k = 0;k<noOfLinksGlobal;k++){
        //   ChainAnimGenerator.positionFlatLink()
        // let pivotCurveSection = (time*chainLinkVelocity/chainCurve.getLength() + (1.5+2*(Math.floor(k/2)))*chordLength/chainCurve.getLength()); //ratio of position along curve to total length (0 - 1)
        // chainCurve.getPointAt(pivotCurveSection % 1, pivotPosition);
        // chainCurve.getPointAt((pivotCurveSection + 0.01) % 1, pivotTarget);
        //slateInLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z);
        // slateInLinkMeshes[k].lookAt(pivotTarget.x, pivotTarget.y, pivotTarget.z);
        //slateInLinkMeshes[k].position.set(pivotPosition.x, pivotPosition.y, pivotPosition.z+((2*(k%2))-1)*GearGenerator.chainLinkThickness/2);
        slateInLinkMeshes[k].visible = true;
        }
    }

    //rotate sprockets
    // console.log(chordLengthOld-chordLength);
    // console.log(Math.PI*2/rearTeethSetArray[activeRearGear]);

    for(let i = 0; i < rearToothedGears.length;i++){

        rearToothedGears[i].rotation.y = angularSpeedRear*time + rearAngleOffset;//+(Math.PI/2 + aMax)+0.25*(chordLengthApprox-chordLengthTrue)*rearTeethSetArray[activeRearGear]/radiusL;//small offset to hide fake chord velocity.
        rearToothedGears[i].material = materialX2; rearToothedGears[i].material.needsUpdate = true;
}

    for(let i = 0; i < frontToothedGears.length;i++){

        frontToothedGears[i].rotation.y = angularSpeedFront*time + frontAngleOffset;//have to check for exact offset at runtime
        frontToothedGears[i].material = materialX2;
        frontToothedGears[i].material.needsUpdate = true;
}

{
    //run only once stuff
}
    rendererNew.toneMappingExposure = 2.75;
    rendererNew.render(scene, camera);
    composer.render();
    requestAnimationFrame(render);
    }

    requestAnimationFrame(render);


}/////////////////////END OF INIT


function resetChainPosition(rearTeethSetArray,frontTeethSetArray,activeRearGear,activeFrontGear, meshGenCallback){

    activeFrontGear = Math.min(activeFrontGear, frontTeethSetArray.length-1);
    activeRearGear = Math.min(activeRearGear, rearTeethSetArray.length-1);
    // console.log(frontTeethSetArray.length-1);
    // console.log(activeFrontGear);

    let chainParams = ChainAnimGenerator.points(rearTeethSet,activeRearGear,frontTeethSet,activeFrontGear);

    adjustedSprocketCentreInterval = GearGenerator.sprocketCentreInterval;
    //noOfLinksGlobal = chainParams[4];
    activeFrontGearGlobal = activeFrontGear;
    activeRearGearGlobal = activeRearGear;
    frontSprocketZShift = -0.5*((rearTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing+(frontTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing);

    rearTeethSet = rearTeethSetArray;
    frontTeethSet = frontTeethSetArray;
    angularSpeedRear = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGear];
    angularSpeedFront = GearGenerator.fiftyTwoAngularVelocity/frontTeethSetArray[activeFrontGear];
    angularSpeedChord = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGearGlobal];

    //check if more links than previous, then add more
    // if(noOfLinksGlobal > bearingLinkMeshes.length){
    //     console.log("got it")
    //     for(let i=bearingLinkMeshes.length-1;i<noOfLinksGlobal;i++){
    //         bearingLinkMeshes.push(bearingLinkMeshes[i-5].clone());
    //         pivotLinkMeshes.push(pivotLinkMeshes[i-5].clone());
    //         slateLinkMeshes.push(slateLinkMeshes[i-5].clone());
    //         slateInLinkMeshes.push(slateInLinkMeshes[i-5].clone());
    //     }
    // }

    

//     let chainParamsArray = ChainAnimGenerator.points(rearTeethSetArray[activeRearGear],frontTeethSetArray[activeFrontGear]);

const carWidth = GearGenerator.carWidth;
const carHeight = GearGenerator.carHeight;
const carLength = GearGenerator.carLength;

const wheelRadius = GearGenerator.wheelRadius;

radiusL = GearGenerator.radius(rearTeethSetArray[activeRearGear]);//RL
radiusR = GearGenerator.radius(frontTeethSetArray[activeFrontGear]);//Rr
let maxTeethCount = 0;

for(let i = 0; i < rearTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,rearTeethSet[i])
}

for(let i = 0; i < frontTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,frontTeethSet[i]);
}

let sprocketCentreHeight = GearGenerator.radius(maxTeethCount)+wheelRadius*1.5;

const sprocketCentreInterval= GearGenerator.sprocketCentreInterval;  //d

let arrayGenPoint = [];
const arrayGenPointL = [];
const arrayGenPointR = [];
const bottomGenPoints = [];
const topGenPoints = [];

const aMax = Math.atan((radiusR-radiusL)/sprocketCentreInterval);
const curveResolution = 100;//15;//number of curve "handles"
let interval = (Math.PI-2*aMax)/(curveResolution/2); //angle interval for arcs during spline generation
let aRanger = aMax;
let chainTheta = 0;
let xPoint = 0;
let yPoint = 0;
let zPoint = 0;

////chain points
//move chains out a bit
let chainExpandFactor = 1;
//smaller sprocker half points
for (let i = 0; i < (curveResolution/2); i++){
    
    chainTheta = Math.PI/2 + aRanger + interval*i;
    xPoint = radiusL*Math.cos(chainTheta);
    yPoint = radiusL*Math.sin(chainTheta) + sprocketCentreHeight;
    zPoint = -carWidth/4 + 2*activeRearGear*GearGenerator.rearSprocketZSpacing;
    
    arrayGenPointL.push(new THREE.Vector3(xPoint,yPoint,zPoint));//append
}



chainTheta = 0;
interval = (Math.PI+2*aMax)/(curveResolution/2); 
aRanger = Math.PI/2 - aMax;

let jtk =  - activeFrontGear;
//larger sprocker half points
for (let j = 0; j < (curveResolution/2); j++){
    chainTheta = Math.PI + aRanger + interval*(j);
    xPoint = sprocketCentreInterval + radiusR*Math.cos(chainTheta);
    yPoint = radiusR*Math.sin(chainTheta) + sprocketCentreHeight;
    zPoint = -carWidth/4 - (activeFrontGear)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift;

    arrayGenPointR.push(new THREE.Vector3(xPoint,yPoint,zPoint));//append
}
bottomGenPoints.push(arrayGenPointL[curveResolution/2 -1]);
topGenPoints.push(arrayGenPointR[curveResolution/2 -1]);
bottomGenPoints.push(arrayGenPointR[0]);
topGenPoints.push(arrayGenPointL[0]);

let bottomSlantHelper, topSlantHelper,chainCurveL,chainCurveR;

chainCurveL = new THREE.CatmullRomCurve3(arrayGenPointL);
chainCurveR = new THREE.CatmullRomCurve3(arrayGenPointR);
bottomSlantHelper = new THREE.CatmullRomCurve3(bottomGenPoints);
topSlantHelper = new THREE.CatmullRomCurve3(topGenPoints);

let chainPoints2 = chainCurveL.getSpacedPoints(curveResolution); //add LHS curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = bottomSlantHelper.getSpacedPoints(curveResolution); //add bottom curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = chainCurveR.getSpacedPoints(curveResolution);//add RHS curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
arrayGenPoint.pop();

chainPoints2 = topSlantHelper.getSpacedPoints(curveResolution);//add top curve
for(let point in chainPoints2){
    arrayGenPoint.push(chainPoints2[point]);
}
chainCurve = new THREE.CatmullRomCurve3(arrayGenPoint);

chordLengthTrue = 2*Math.PI*radiusL/rearTeethSetArray[activeRearGear];//2xPIxR/teethcount
noOfLinksGlobal = Math.round(0.5*chainCurve.getLength()/chordLengthTrue)*2;//force multiples of 2 (outer link inner link alternating)
chordLengthApprox= chainCurve.getLength()/noOfLinksGlobal;
angularSpeedChord = angularSpeedRear;
angularSpeedRear *= chordLengthTrue/chordLengthApprox;
angularSpeedFront *= chordLengthTrue/chordLengthApprox; 



function resizeRendererToDisplaySize(rendererNew){
    const canvas = rendererNew.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
        rendererNew.setSize(width*2.2, height*2.2, false);
    }
    return needResize
}

hasFrontAngleOffset = false;
hasRearAngleOffset = false;

bearingLinkMeshes = meshGenCallback(noOfLinksGlobal, bearingMesh);
        pivotLinkMeshes = meshGenCallback(noOfLinksGlobal, pivotMesh);
        slateLinkMeshes = meshGenCallback(noOfLinksGlobal, slateMesh);
        slateInLinkMeshes = meshGenCallback(noOfLinksGlobal, slateMeshIn);
        chainPiecesSet = [bearingLinkMeshes,pivotLinkMeshes,slateLinkMeshes,slateInLinkMeshes];

    chainPiecesSet = [bearingLinkMeshes,pivotLinkMeshes,slateLinkMeshes,slateInLinkMeshes];

console.log("noOfLinksGlobal " + noOfLinksGlobal);


//visualize spaced points 

// const sphereGeomtry = new THREE.SphereBufferGeometry( 0.1 );
// const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

// const spacedPoints = chainCurve.getPoints( 100 );

// for ( let point of spacedPoints ) {

// 	const helper = new THREE.Mesh( sphereGeomtry, sphereMaterial );
// 	helper.position.copy( point );
// 	scene.add( helper );

// }

}/////////////END OF RESET ChainPosition



function resetSprocketModels(rearTeethSetArray,frontTeethSetArray,activeRearGear,activeFrontGear, meshGenCallback){
    let chainParams = ChainAnimGenerator.points(rearTeethSetArray,activeRearGear,frontTeethSetArray,activeFrontGear);
    //noOfLinksGlobal = chainParams[4];
    frontSprocketZShift = -0.5*((rearTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing+(frontTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing);

    rearTeethSet = rearTeethSetArray;
    frontTeethSet = frontTeethSetArray;
    activeFrontGearGlobal = activeFrontGear;
    activeRearGearGlobal = activeRearGear;
    angularSpeedRear = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGear];
    angularSpeedFront = GearGenerator.fiftyTwoAngularVelocity/frontTeethSetArray[activeFrontGear];
    angularSpeedChord = GearGenerator.fiftyTwoAngularVelocity/rearTeethSetArray[activeRearGearGlobal];

const carWidth = GearGenerator.carWidth;
const carHeight = GearGenerator.carHeight;
const carLength = GearGenerator.carLength;

const wheelRadius = GearGenerator.wheelRadius;

radiusL = GearGenerator.radius(rearTeethSetArray[activeRearGear]);//RL
radiusR = GearGenerator.radius(frontTeethSetArray[activeFrontGear]);//Rr
let maxTeethCount = 0;

for(let i = 0; i < rearTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,rearTeethSet[i])
}

for(let i = 0; i < frontTeethSetArray.length;i++){
    maxTeethCount = Math.max(maxTeethCount,frontTeethSet[i]);
}

let sprocketCentreHeight = GearGenerator.radius(maxTeethCount)+wheelRadius*1.5;

//const sprocketCentreInterval= GearGenerator.sprocketCentreInterval;  //d

let extrudeSettings;
let sprocketChildren = [];
// let sprocketChild;
scene.traverse(function(child){
    if(child && child.name == "sprocket"){
        sprocketChildren.push(child);
        // scene.remove(child);
    }
});
// console.log(sprocketChildren);
for(let i=0; i<sprocketChildren.length;i++){
    scene.remove(sprocketChildren[i]);
    // console.log("working2");
}


rearToothedGears = [];
// console.log(scene.children);

// // let material;
let sprocketToothed;
for(let j = 0;j < rearTeethSetArray.length; j++){ 
sprocketToothed = BespokeGeo.sprocket(rearTeethSetArray[j],0,sprocketCentreHeight,-carWidth/4 + 2*j*GearGenerator.rearSprocketZSpacing);
sprocketToothed.name = "sprocket";
sprocketToothed.scale.set(1,GearGenerator.sprocketThicknessScale,1);
rearToothedGears.push(sprocketToothed);
scene.add(sprocketToothed);


extrudeSettings = GearGenerator.extrudeSettings;

}//end of rear sprocket set 'for loop'

frontToothedGears = [];
for(let j = 0; j<frontTeethSetArray.length;j++){
    sprocketToothed = BespokeGeo.sprocket(frontTeethSetArray[(frontTeethSetArray.length-j-1)],GearGenerator.sprocketCentreInterval,sprocketCentreHeight,-carWidth/4 + (-frontTeethSetArray.length+1 + j)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift);
    
    // console.log("test");//+(-carWidth/4 + (-frontTeethSetArray.length+1 + j)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift));
    frontToothedGears.push(sprocketToothed);
    sprocketToothed.name = "sprocket";
    sprocketToothed.scale.set(1,GearGenerator.sprocketThicknessScale,1);
    scene.add(sprocketToothed);
    }//end of front sprocket 'for loop'


function resizeRendererToDisplaySize(rendererNew){
    const canvas = rendererNew.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const needResize = canvas.width !== width || canvas.height !== height;
    if(needResize){
        rendererNew.setSize(width*2.2, height*2.2, false);
    }
    return needResize
}

}/////////////END OF RESET Sprocket Models



function generateChainLinks(genNoOfLinks, meshObject){
    let genLinkMeshes = [];

for(let i = 0; i<genNoOfLinks;i++){
    genLinkMeshes.push(meshObject.clone());
    scene.add(genLinkMeshes[i]);
    }

    return genLinkMeshes;
}

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
    
    ////if(isFirstRun){
        ////init(rearTeethCorrected,frontTeethCorrected,0,1,generateChainLinks);
        ////isFirstRun = false;
    ////}
    ////else {
        
        resetSprocketModels(rearTeethCorrected,frontTeethCorrected,0,0,generateChainLinks);
        setActiveRearGear(activeRearGearGlobal,activeFrontGearGlobal);
    ////}
    
}

function setActiveRearGear(activeRearGearGlobal,activeFrontGearGlobal){
    noOfLinksOld = noOfLinksGlobal;

    scene.traverse(function(child){
        if(child.name == "bearing_LP001"){child.visible = false;}
        if(child.name == "pivot_LP001"){child.visible = false;}
        if(child.name == "slate_LP001"){child.visible = false;}
        if(child.name == "slate_LPin001"){child.visible = false;}

    
    });
    resetChainPosition(rearTeethSet,frontTeethSet,activeRearGearGlobal,activeFrontGearGlobal,generateChainLinks);
    
}

// getTeethCount(["30","25","20","16","8"],["40","30", "20","10","8"]);
// init(["30","24","22","20","18","14","12"],["40","28", "15"],0,1,generateChainLinks);
init(["30","25","20","16","8"],["40","30", "20","10","8"],2,2,generateChainLinks);
console.log(noOfLinksGlobal);

window.getTeethCount = getTeethCount;
window.setActiveRearGear = setActiveRearGear;
