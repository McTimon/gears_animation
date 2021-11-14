
/*------------------DONE----------------

//add env map - DONE 
//bring back the orbit functionality - DONE
//let gears rotate according to correct ratio - DONE
//bottom of gears sets floor, not bottom of chain -DONE
//lengthen tip of sprocket - DONE
-fill in back faces - DONE
-use stool code to change from cubemap to equirectangular - DONE
-set overall "52 engaged angular speed", the calculate everything else from it - DONE
//slant the teeth, then slant the tip too - DONE
//create dom on the fly like helmet example to fix hdri issue - DONE (something else worked!)
//better chain models (just do this in blender) - DONE
-Make sprocket thinner, make them a bit further apart, add separator rings -DONE -no separator rongs
-use chordlength ratio to get a general offset for rear gear () - DONE


---------------------------------------------------
*/

/*---------------------PENDING----------------------
//centre the animation based on target window size 
change rotation to clockwise (just multiply angle rotation by -1)

--------------------------------------------------------------
*/

/*---------------TO DO------------------------
-change to real dimensions (metres)
-change to clockwise 
    -curve moves from 0 to 1 so negatives won't work. you have to change the drawing 
    direction,and now start from the top slant
    -think of the frontwheel as the driving gear, and it will now have the predictable
    offsets
-check centering of gears (move all z position calc to one place)

make sprockets thinner - 
take out gap, or make very small
-brushed metal normal texture for flat sides, just fix in photoshop
-work on speed. remove one-time stuff from renderloop, or try to add flags
save some things to var instead of calculating every time
-put some things like curve gen n other duplicate stuff into functions
-test removing AO
-remove chainThickness scale n set dim directly
-finally, remember to remove all console logs n unused files
-write mod function in bike gears, mod gear angle with speed 
-try curve res of like 1000/4 to see if link angle misaligns now (as it should), the correct as the average
*/

/*----------------NOTES-------------------------
Distances use chain chord length while speeds use arc length.

*/
