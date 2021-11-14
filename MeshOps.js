//try to modularize and refactor the facing and bevels n stuff
//write function to calculate flipped normal for true inversion in 'make inverted quad face'
let MeshOps = {
    makeQuadFace : function(vertA,vertB,vertC,vertD,normalA,normalB,normalC,normalD,uvA,uvB,uvC,uvD){
        let sixVertsArray = [];
        // let ringVerts = [];

        let vert = {
            pos: vertA, 
            norm: normalA, 
            uv: uvA
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertB, 
            norm: normalB, 
            uv: uvB
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertC, 
            norm: normalC, 
            uv: uvC
         }
         sixVertsArray.push(vert);
         ///////////////////////////////////////
         vert = {
            pos: vertC, 
            norm: normalC, 
            uv: uvC 
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertD, 
            norm: normalD, 
            uv: uvD 
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertA, 
            norm: normalA, 
            uv: uvA 
         }
         sixVertsArray.push(vert);
         ///////////////////////////////////////

        return sixVertsArray;
    },
    makeInvertedQuadFace : function(vertA,vertB,vertC,vertD,normalA,normalB,normalC,normalD,uvA,uvB,uvC,uvD){
        let sixVertsArray = [];
        // let ringVerts = [];



        let vert = {
            pos: vertB, 
            norm: normalB, 
            uv: uvB
         }
         sixVertsArray.push(vert);

          vert = {
            pos: vertA, 
            norm: normalA, 
            uv: uvA
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertC, 
            norm: normalC, 
            uv: uvC
         }
         sixVertsArray.push(vert);
         ///////////////////////////////////////
         vert = {
            pos: vertC, 
            norm: normalC, 
            uv: uvC 
         }
         sixVertsArray.push(vert);


         vert = {
            pos: vertA, 
            norm: normalA, 
            uv: uvA 
         }
         sixVertsArray.push(vert);

         vert = {
            pos: vertD, 
            norm: normalD, 
            uv: uvD 
         }
         sixVertsArray.push(vert);

         ///////////////////////////////////////

        return sixVertsArray;
    },
    mirror: function(){},
    mirrorAndDuplicate: function(){},
    duplicate: function(){},
    rotate: function(){},
    

}

export {MeshOps};