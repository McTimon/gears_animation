import{addPrimitiveMesh} from './addPrimitiveMesh.js';
import { InstancedInterleavedBuffer } from './three.module.js';

var ProcessKeyPress = function(){
    this.action = function(parent){
        // canvas.addEventListener("keypress",logKey);
        document.onkeydown = function(e){
            e = e || window.event;
            var charCode = e.code;
            console.log("listening...");

            if (charCode === "Space"){
                let inserted = new addPrimitiveMesh(parent);
                inserted.addCube();
            }
        }
        // console.log("action working");
    }
    

}

export {ProcessKeyPress};