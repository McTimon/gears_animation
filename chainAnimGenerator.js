
import {GearGenerator} from './GearGenerator.js';
/*

-generate current point on curve
-pick previous and next points and calc respective angles
-return angles for current point so it can be applied to mesh
-take speed as input to move points along

*/

//curve

//divide all realworld dimms by 75 for accuracy
let mod = function(a,b){
    if(b<a){
    return b*(((a*100.01)/(b*100.01) - Math.floor(a/b)));
    }
    else return a;
}

let curvePoints = [];
let carWidth = GearGenerator.carWidth;
let aMaxGlobal = 0;
let xIntervalGlobal = 0;
let chainLengthGlobal = 0;
let adjustedRearArcLength = 0;
let c /*ycleEvenSwitchGlobal*/ = 0;
let notCheckedA = true;
let aMaxSignGlobal = 1;
let birdsEyeSignGlobal = -1;

let noOfLinks;
let calculateChainLength = function(rearTeethSetArray,activeRearGear, frontTeethSetArray, activeFrontGear){
//chain length = arcL + arcR + 2L
//arcL = 2*Pi*rL*thetaL/360
//arcR = 2*Pi*rR*thetaR/360
//L = squareRoot(sprocketCentreInterval^2 - abs(rR-rL)^2)
let rearTeethCount = parseInt(rearTeethSetArray[activeRearGear]);
let frontTeethCount = parseInt(frontTeethSetArray[activeFrontGear]);

// if(frontTeethCount < rearTeethCount){
//     console.log("Front Teeth Count "+ frontTeethCount);
//     console.log("Rear Teeth Count "+ rearTeethCount);
//     aMaxSignGlobal = -1;
// }
// else aMaxSignGlobal = 1;
let rL = 0.3125/(2*Math.sin(Math.PI/rearTeethCount));//GearGenerator.radius(rearTeethCount);
let rR = 0.3125/(2*Math.sin(Math.PI/frontTeethCount));//GearGenerator.radius(frontTeethCount);

let frontSprocketZShift = -0.5*((rearTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing+(frontTeethSetArray.length-1)*2*GearGenerator.rearSprocketZSpacing);
let jFront = frontTeethSetArray.length - activeFrontGear - 1;//start from the other side of the array
let jRear = activeRearGear;

let rearBearingZ = -carWidth/4 + 2*jRear*GearGenerator.rearSprocketZSpacing;
let frontBearingZ = -carWidth/4 + (-frontTeethSetArray.length+1 + jFront)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift;

let Z = frontBearingZ - rearBearingZ;
// console.log(rL);
// console.log(rR);
const aMax = Math.atan(Math.abs(rR-rL)/GearGenerator.sprocketCentreInterval);
let thetaL = Math.PI - 2*aMax*aMaxSignGlobal;
let thetaR = Math.PI + 2*aMax*aMaxSignGlobal;
aMaxGlobal = aMax;
let L = Math.sqrt(GearGenerator.sprocketCentreInterval**2 + Math.abs(rR-rL)**2 + Math.abs(Z)**2);
// console.log(L);
let arcL = 2*Math.PI*rL*thetaL/(2*Math.PI);
let arcR = 2*Math.PI*rR*thetaR/(2*Math.PI);
let chainLength = arcL + arcR + 2*L;
return [chainLength,arcL,arcR,L];
//arcL = 2*Pi*rL*thetaL/360
//arcR = 2*Pi*rR*thetaR/360
//L = squareRoot(sprocketCentreInterval^2 - abs(rR-rL)^2)
}
let ChainAnimGenerator = {
    points: function(rearTeethSetArray,activeRearGear, frontTeethSetArray, activeFrontGear){

        let chainParams = calculateChainLength(rearTeethSetArray,activeRearGear, frontTeethSetArray, activeFrontGear);
        const singleChainLength = GearGenerator.chainLinkLength;
        const chainLength = chainParams[0];
        noOfLinks = Math.round(chainLength/singleChainLength);
        
        let adjustedSprocketCentreInterval = GearGenerator.sprocketCentreInterval;
        const arcL = chainParams[1];
        const arcR = chainParams[2];
        const L = chainParams[3];
        let LNew = (noOfLinks*singleChainLength-arcL-arcR)/2;
        adjustedSprocketCentreInterval = LNew*Math.cos(aMaxGlobal);
        // console.log(adjustedSprocketCentreInterval);
        const arcLRatio = arcL/chainLength;
        const arcRatio = arcR/chainLength;
        const LRatio = L/chainLength;
        chainLengthGlobal = arcL + arcR + 2*LNew;

        for(let i = 0; i < Math.ceil(arcLRatio*noOfLinks);i++){}//position arcL links
        for(let i = 0; i < Math.ceil(LRatio*noOfLinks);i++){}//position L lower links
        for(let i = 0; i < Math.ceil(arcRatio*noOfLinks);i++){}//position arcR links
        for(let i = 0; i < Math.ceil(LRatio*noOfLinks);i++){}//position L above links

        // console.log(noOfLinks);
        chainParams.push(noOfLinks);
        chainParams.push(adjustedSprocketCentreInterval);
        xIntervalGlobal = adjustedSprocketCentreInterval;
        // console.log("Single chain length: ");
        // console.log(singleChainLength);
        
        

        //iterator drives animation in 4 parts: arcL, L(lower), arcR, L(above)
        return chainParams;
    },
    positionFlatLink: function(chainPiecesSet,sprocketCentreHeight){
        let outerSlateArray,innerSlateArray,bearingArray,pivotArray;
        bearingArray = chainPiecesSet[0]
        pivotArray = chainPiecesSet[1]
        outerSlateArray = chainPiecesSet[2]
        innerSlateArray = chainPiecesSet[3];
        let k2 = 0;
        let k3 = 0;
        let prevIndexInner, prevIndexOuter;

        for(let k = 0; k < bearingArray.length;k++){
            k2 = Math.floor(k/2)*2;//force even index
            k3 = k2 + 1; //force odd index
            prevIndexInner = k2;
            if(k2 == 0){
                prevIndexOuter = bearingArray.length-1
            }
            else{
                prevIndexOuter = k2-1;
            }
             

        
        outerSlateArray[k].position.set(
            (bearingArray[k2].position.x + bearingArray[prevIndexOuter].position.x)/2,
            (bearingArray[k2].position.y + bearingArray[prevIndexOuter].position.y)/2,
            (bearingArray[k2].position.z + bearingArray[prevIndexOuter].position.z + ((2*(k%2))-1)*GearGenerator.chainLinkThicknessOuter)/2);  
        outerSlateArray[k].rotation.set(
            (bearingArray[prevIndexOuter].rotation.x),
            (bearingArray[prevIndexOuter].rotation.y),
            (bearingArray[prevIndexOuter].rotation.z ));  

            // if(Math.abs(bearingArray[k2].rotation.z + bearingArray[prevIndexOuter].rotation.z)< 0.05 && (Math.abs(Math.abs(bearingArray[k2].position.y) - sprocketCentreHeight)<  1)){
            //     outerSlateArray[k].rotation.z = Math.PI/2;
            // }
        
        innerSlateArray[k].position.set(
            (bearingArray[k3].position.x + bearingArray[prevIndexInner].position.x)/2,
            (bearingArray[k3].position.y + bearingArray[prevIndexInner].position.y)/2,
            (bearingArray[k3].position.z + bearingArray[prevIndexInner].position.z + ((2*(k%2))-1)*GearGenerator.chainLinkThickness)/2);  
        innerSlateArray[k].rotation.set(
            (bearingArray[prevIndexInner].rotation.x),
            (bearingArray[prevIndexInner].rotation.y),
            (bearingArray[prevIndexInner].rotation.z ));  

            // if(Math.abs(bearingArray[k3].rotation.z + bearingArray[prevIndexInner].rotation.z)< 0.05 && (Math.abs(Math.abs(bearingArray[k3].position.y) - sprocketCentreHeight)<  1)){
            //     innerSlateArray[k].rotation.z = Math.PI/2;
            // }
        
    
         }
    
        },
    moveChain: function(rearTeethSetArray,activeRearGear,frontTeethSetArray,activeFrontGear,chainPiecesSet,angularSpeedRear,angularSpeedFront,sprocketCentreHeight, frontSprocketZShift,time){
        //
        // console.log(mod(3.5,2));

        let outerSlateArray,innerSlateArray,bearingArray,pivotArray;
        bearingArray = chainPiecesSet[0]
        pivotArray = chainPiecesSet[1]
        outerSlateArray = chainPiecesSet[2]
        innerSlateArray = chainPiecesSet[3];
        
        let rearTeethSet = rearTeethSetArray;
        let frontTeethSet = frontTeethSetArray;
        let rearTeethCount = parseInt(rearTeethSet[activeRearGear]);
        let frontTeethCount = parseInt(frontTeethSet[activeFrontGear]); 

        let rearRad = GearGenerator.radius(rearTeethCount);            
        let frontRad = GearGenerator.radius(frontTeethCount);        
     

        // rearRad = 0.3125/(2*Math.sin(Math.PI/rearTeethCount));
        // frontRad = 0.3125/(2*Math.sin(Math.PI/frontTeethCount));
        let jFront = frontTeethSet.length - activeFrontGear - 1;//start from the other side of the array
        let jRear = activeRearGear;
        if(frontTeethCount <  rearTeethCount){
            aMaxSignGlobal = -1;
        }
        else {aMaxSignGlobal = 1;}
        // console.log("ft :" + frontTeethCount);
        // console.log(rearTeethCount);
        // console.log(aMaxSignGlobal);
        // console.log(sprocketCentreHeight);
        let speed = angularSpeedRear;

        let teethSum = parseInt(frontTeethCount)/1.0 + parseInt(rearTeethCount)/1.0;
        let gearRatio = rearTeethCount/teethSum;
        // console.log(teethSum);
        // console.log(rearTeethCount);
        // console.log(gearRatio);

        let totalChain = calculateChainLength(rearTeethSetArray,activeRearGear, frontTeethSetArray, activeFrontGear)
        // console.log(frontTeethCount);
        
        let rearBearingZ = -carWidth/4 + 2*jRear*GearGenerator.rearSprocketZSpacing;
        let frontBearingZ = -carWidth/4 + (-frontTeethSet.length+1 + jFront)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift;
        
        
        let distParams = calculateChainLength(rearTeethSetArray,activeRearGear, frontTeethSetArray, activeFrontGear);
        let totalDist = chainLengthGlobal;
        let cycleTime = totalDist/(rearRad*angularSpeedRear);         
        //chainLengthGlobal = totalDist;
        // console.log(totalDist);
        // console.log(chainLengthGlobal);
        let rearArcDist = distParams[1];
        
        let frontArcDist = distParams[2];
        let slantDist = distParams[3];
        let sprocketCentreIntervalA = xIntervalGlobal;
        let birdsEyeSlantAngle = Math.atan((frontBearingZ-rearBearingZ)/sprocketCentreIntervalA);
        let aMax = Math.atan(Math.abs(rearRad-frontRad)/sprocketCentreIntervalA);
        let coveredDist = 0;
        
        let flatOffsetScalar = rearRad*Math.PI*2/rearTeethCount;
        let offsetTime = cycleTime*flatOffsetScalar/totalDist;
        // console.log(Math.round(rearArcDist/0.3)*0.3);


        // console.log(rearRad);

        // console.log(birdsEyeSlantAngle);
        
        //console.log(totalDist[0]);

        //rear sprocket part
        // for(let k = 0; k<noOfLinks;k++){
            // let c = 0;

            //digit colliders
             let fakeTime = mod(time,offsetTime);     

            if((fakeTime > offsetTime/1.5) && notCheckedA){
                notCheckedA = false;

            }
            if((fakeTime < offsetTime/3) && !notCheckedA){
                c+=1;                
                notCheckedA = true
            }

            // console.log(aMaxSignGlobal);

        for(let k = 0; k<noOfLinks;k++){

            let rearAngle = fakeTime*speed+k*Math.PI*2/rearTeethCount;//,Math.PI*4);
            let flatOffset = rearRad*k*Math.PI*2/rearTeethCount;
            let tipV = totalDist/cycleTime;

            
            time = mod(time,cycleTime);
            speed = angularSpeedRear;
            // rearAngle %=2*Math.PI;

            coveredDist = mod(rearRad*rearAngle,totalDist);
            // coveredDist = 500;

            //move rear sprocket part
            if (coveredDist < rearArcDist){
                            
            let rearLinkPosition = {
                x:rearRad*Math.cos(rearAngle + Math.PI/2 + aMax*aMaxSignGlobal),
                y:sprocketCentreHeight + rearRad*Math.sin(rearAngle + Math.PI/2 + aMax*aMaxSignGlobal),
                z:rearBearingZ
            }

                bearingArray[k].position.set(rearLinkPosition.x,rearLinkPosition.y,rearLinkPosition.z);   
                pivotArray[k].position.set(rearLinkPosition.x,rearLinkPosition.y,rearLinkPosition.z);    
                innerSlateArray[k].rotation.set(
                    0,
                    0,
                    rearAngle -Math.PI/rearTeethCount+aMax*aMaxSignGlobal// -aMax+aMax*aMaxSignGlobal
                    );
                outerSlateArray[k].rotation.set(
                    0,
                    0,
                    rearAngle -Math.PI/rearTeethCount+aMax*aMaxSignGlobal// -aMax+aMax*aMaxSignGlobal
                    );
           }
             else if(coveredDist < (rearArcDist + slantDist)){
            
                //bottom slant part
                //coveredDist = rearArcDist + (rearRad*speed*time);
                    
                    // console.log("I'm in");

                    let currSlantX = rearRad*rearAngle*Math.cos(aMax)*Math.cos(birdsEyeSlantAngle) - rearArcDist*Math.cos(aMax) - rearRad*Math.sin(aMax)*aMaxSignGlobal;
                    let slantBLinkPosition = {
                        x: rearRad*rearAngle*Math.cos(aMax)*Math.cos(birdsEyeSlantAngle) - (rearArcDist)*Math.cos(aMax) - rearRad*Math.sin(aMax)*aMaxSignGlobal ,
                        y: sprocketCentreHeight - rearRad*rearAngle*Math.sin(aMax)*aMaxSignGlobal+(rearArcDist)*Math.sin(aMax)*aMaxSignGlobal - rearRad*Math.cos(aMax),
                        z: rearBearingZ + currSlantX*Math.tan(birdsEyeSlantAngle) 
                    }

                    // console.log(birdsEyeSlantAngle);
        
                    let slantBLinkRotation = {
                        x: 0,
                        y: -birdsEyeSlantAngle,
                        z: 0
                    }

                    bearingArray[k].position.set(slantBLinkPosition.x, slantBLinkPosition.y,slantBLinkPosition.z);
                    bearingArray[k].rotation.set(slantBLinkRotation.x,slantBLinkRotation.y,slantBLinkRotation.z);
                    pivotArray[k].position.set(slantBLinkPosition.x, slantBLinkPosition.y,slantBLinkPosition.z);
                    pivotArray[k].rotation.set(slantBLinkRotation.x,slantBLinkRotation.y,slantBLinkRotation.z);
                    innerSlateArray[k].rotation.set(
                        0,
                        -birdsEyeSlantAngle,
                        -aMax*aMaxSignGlobal);
                    outerSlateArray[k].rotation.set(
                        0,
                        -birdsEyeSlantAngle,
                        -aMax*aMaxSignGlobal);

            }
            else if(coveredDist > (rearArcDist + slantDist) && coveredDist < (rearArcDist + slantDist + frontArcDist)){

        //front sprocket part
        
            let frontTime = fakeTime - (rearArcDist + slantDist)/(rearRad*angularSpeedRear);
            let frontAngle = frontTime*angularSpeedFront+k*Math.PI*2/frontTeethCount;
            let frontLinkPosition = {
                x:sprocketCentreIntervalA+frontRad*Math.cos(frontAngle - Math.PI/2 - aMax*aMaxSignGlobal),
                y:sprocketCentreHeight + frontRad*Math.sin(frontAngle - Math.PI/2 - aMax*aMaxSignGlobal),
                z:-carWidth/4 + (-frontTeethSet.length+1 + jFront)*2*GearGenerator.rearSprocketZSpacing - frontSprocketZShift
            
            };
        
             bearingArray[k].position.set(frontLinkPosition.x,frontLinkPosition.y,frontLinkPosition.z);  
             pivotArray[k].position.set(frontLinkPosition.x,frontLinkPosition.y,frontLinkPosition.z);  
             innerSlateArray[k].rotation.set(
                0,
                0,
                frontAngle - Math.PI/frontTeethCount-(aMax)*aMaxSignGlobal
                );
            outerSlateArray[k].rotation.set(
                0,
                0,
                frontAngle - Math.PI/frontTeethCount-(aMax)*aMaxSignGlobal
                );
        
            }
             else if(coveredDist < totalDist){
                //top slant part
                    //tipV = frontRad * angularSpeedFront;
                    let topSlantTime = fakeTime - (rearArcDist + slantDist + frontArcDist)/(rearRad*angularSpeedRear);
                    let negRearAngle = -time*speed+k*Math.PI*2/rearTeethCount;

                    let currSlantX =  ((tipV*topSlantTime + flatOffset)*Math.cos(aMax)*Math.cos(birdsEyeSlantAngle));
                    let slantBLinkPosition = {
                        // x: GearGenerator.sprocketCentreInterval - frontRad*Math.sin(aMax) - rearRad*angularSpeedRear*topSlantTime*Math.cos(aMax),// - rearRad*angularSpeedRear*topSlantTime*Math.cos(aMax), //- rearArcDist*Math.cos(aMax) - rearRad*Math.sin(aMax),
                        // x: rearRad*negRearAngle*Math.cos(aMax) - rearRad*Math.sin(aMax) - rearArcDist*Math.cos(aMax) - slantDist*Math.cos(aMax) - frontArcDist*Math.cos(aMax) + GearGenerator.sprocketCentreInterval,// - rearRad*angularSpeedRear*topSlantTime*Math.cos(aMax), //- rearArcDist*Math.cos(aMax) - rearRad*Math.sin(aMax),
                        x: sprocketCentreIntervalA - frontRad*Math.sin(aMax)*aMaxSignGlobal - ((tipV*topSlantTime + flatOffset)*Math.cos(aMax)*Math.cos(birdsEyeSlantAngle)),
                        y: sprocketCentreHeight + frontRad*Math.cos(aMax) - ((tipV*topSlantTime + flatOffset)*Math.sin(aMax)*Math.cos(birdsEyeSlantAngle)*aMaxSignGlobal),// + frontRad*Math.cos(aMax),// + frontRad*angularSpeedFront*Math.sin(aMax),
                        z: frontBearingZ - currSlantX*Math.tan(birdsEyeSlantAngle)
                    }
        
                    let slantBLinkRotation = {
                        x: 0,
                        y: -birdsEyeSlantAngle,
                        z: 0
                    }

                    bearingArray[k].position.set(slantBLinkPosition.x, slantBLinkPosition.y,slantBLinkPosition.z);
                    bearingArray[k].rotation.set(slantBLinkRotation.x,slantBLinkRotation.y,slantBLinkRotation.z);
                    pivotArray[k].position.set(slantBLinkPosition.x, slantBLinkPosition.y,slantBLinkPosition.z);
                    pivotArray[k].rotation.set(slantBLinkRotation.x,slantBLinkRotation.y,slantBLinkRotation.z);
                    innerSlateArray[k].rotation.set(
                        0,
                        -birdsEyeSlantAngle,
                        aMax*aMaxSignGlobal);
                    outerSlateArray[k].rotation.set(
                        0,
                        -birdsEyeSlantAngle,
                        aMax*aMaxSignGlobal);
            }

            let prevIndex = k-1;
            //set slates based on pivots
            if(k == 0){
                prevIndex = bearingArray.length -1;
            
        }
            // let slateAngle = 0;
            // let fullLength = Math.sqrt(
            //     (bearingArray[k].position.x - bearingArray[prevIndex].position.x) ** 2 +
            //     (bearingArray[k].position.y - bearingArray[prevIndex].position.y) ** 2 
            // );


            // slateAngle = Math.acos(fullLength/
            //     bearingArray[k].position.x - bearingArray[prevIndex].position.x
            //     );
            // if(k == 0){
            //     innerSlateArray[k].position.set(
            //         0*(bearingArray[k].position.x),
            //         0*(bearingArray[k].position.y),
            //         (bearingArray[k].position.z + bearingArray[prevIndex].position.z - GearGenerator.chainLinkThickness)/2);  

            //         outerSlateArray[k].position.set(
            //             0*(bearingArray[k].position.x),
            //             0*(bearingArray[k].position.y),
            //             (bearingArray[k].position.z + bearingArray[prevIndex].position.z + GearGenerator.chainLinkThickness)/2);
            // }

            // if(k == bearingArray.length-1){
            //     innerSlateArray[k].position.set(
            //         0*(bearingArray[bearingArray.length-1].position.x),
            //         0*(bearingArray[bearingArray.length-1].position.y),
            //         1+(bearingArray[k].position.z + bearingArray[prevIndex].position.z - GearGenerator.chainLinkThickness)/2);  

            //         outerSlateArray[k].position.set(
            //             0*(bearingArray[bearingArray.length-1].position.x),
            //             0*(bearingArray[bearingArray.length-1].position.y),
            //             1+(bearingArray[k].position.z + bearingArray[prevIndex].position.z + GearGenerator.chainLinkThickness + (k%2)*0.01)/2);
            // }




            //if(k < bearingArray.length - 1){
            innerSlateArray[k].position.set(
                (bearingArray[k].position.x + bearingArray[prevIndex].position.x)/2,
                (bearingArray[k].position.y + bearingArray[prevIndex].position.y)/2,
                (bearingArray[k].position.z + bearingArray[prevIndex].position.z - GearGenerator.chainLinkThickness - ((k+c)%2)*0.04)/2);  

            outerSlateArray[k].position.set(
                (bearingArray[k].position.x + bearingArray[prevIndex].position.x)/2,
                (bearingArray[k].position.y + bearingArray[prevIndex].position.y)/2,
                (bearingArray[k].position.z + bearingArray[prevIndex].position.z + GearGenerator.chainLinkThickness + ((k+c)%2)*0.04)/2); //5 offset for debugging
            //}

        }

    }

    
}

export {ChainAnimGenerator};