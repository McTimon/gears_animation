import { leftGearPoints,rightGearPoints,GearGenerator } from "./GearGenerator.js";

//consider manual animation of chain links since animation is uneven
//chain length = arcL + arcR + 2L
//arcL = 2*Pi*rL*thetaL/360
//arcR = 2*Pi*rR*thetaR/360
//L = squareRoot(sprocketCentreInterval^2 - abs(rR-rL)^2)

//calulate no. of chain links to match teeth sizes