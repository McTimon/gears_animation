//dimms are metre x 10

const carWidth = 0.02;
let leftTeethCount= 15;
let rightTeethCount= 150;


const GearGenerator = {//shared parameters
    extrudeSettings: {
        steps: 2,
        depth: carWidth/2,
        bevelEnabled: true,
        bevelThickness: carWidth/6,
        bevelSize: carWidth/6,
        bevelOffset: -carWidth/2,
        bevelSegments: 2
    },

    radius: function(teethCount){
        //assuming 52 radius is 200mm
        //2*PI*Rx/TeethCountx shd give a fixed chord length.
        let radius = 2.0*teethCount/52.0;
        return radius
    },

    carWidth : carWidth,
    carHeight : 0.15,
    carLength : 0.4,
    sprocketCentreInterval: 5/*2 + 5 + 5*/,

    wheelRadius  :.1,
    wheelThickness : .05,
    wheelSegments : 16,
    noOfLinks : 70/*134*/,
    radiusRMax: 5,
    leftTeethCount: leftTeethCount,
    rightTeethCount: rightTeethCount,

    rightSprocketCentreZOffset: 0,//-1.5,
    rearSprocketZSpacing:0.03,
    sprocketThicknessScale:0.3,
    sprocketThickness:0.08, //8mm

    fiftyTwoAngularVelocity: 30*0.05*10,//22
    extensionGrooveAngle: 16, //angle from rotation axis in degrees
    extensionTipAngle:25,     //angle from rotation axis in degrees
    chainLinkLength: 0.3125,
    chainLinkThickness: 0.04,
    chainLinkThicknessOuter: 0.07
};

// let radiusR = GearGenerator.radius(rightTeethCount);

var leftGearPoints = function(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight,radiusR){
    const d = 0;
    return gearPoints(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight, d,radiusR);
};
let rightGearPoints = function(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight,radiusR){
    const d = GearGenerator.sprocketCentreInterval;
    return gearPoints(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight, d,radiusR);;
};

let gearPoints = function(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight, d,radiusR){

    // let radiusR = GearGenerator.radiusRMax;
    const steps = 6;
    let handleOffsetScale = 1.15;
    let rad = Math.PI*2/steps;
    let radiusGearNew=GearGenerator.radius(teethCount);
    let generatedPoints = [];

    for(let i = 0; i<steps+1;i++){
        generatedPoints.push([handleOffsetScale*radiusGearNew*Math.cos(rad*(i-0.5))+d,
        handleOffsetScale*radiusGearNew*Math.sin(rad*(i-0.5))+radiusR,
        radiusGearNew*Math.cos(rad*(i))+d,
        radiusGearNew*Math.sin(rad*(i))+radiusR]);
    }

    return generatedPoints;
};

let gearSetPoints = function(teethCount,radiusToTeethRatio,attackAngle,chainLinkHeight, d,radiusR){

    // let radiusR = GearGenerator.radiusRMax;
    const steps = 6;
    let handleOffsetScale = 1.15;
    let rad = Math.PI*2/steps;
    let radiusGearNew=GearGenerator.radius(teethCount);
    let generatedPoints = [];

    for(let i = 0; i<steps+1;i++){
        generatedPoints.push([handleOffsetScale*radiusGearNew*Math.cos(rad*(i-0.5))+d,
        handleOffsetScale*radiusGearNew*Math.sin(rad*(i-0.5))+radiusR,
        radiusGearNew*Math.cos(rad*(i))+d,
        radiusGearNew*Math.sin(rad*(i))+radiusR]);
    }

    return generatedPoints;
};



export {leftGearPoints,rightGearPoints,GearGenerator};