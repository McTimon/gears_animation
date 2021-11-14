import * as THREE from './three.module.js'

var addPrimitiveMesh = function (parent) {
    this.addCube = function(){
        var geometry = new THREE.BoxGeometry(5,5,5);
        var material = new THREE.MeshPhongMaterial({color:"#88bb88",emissive:0x010101});
        var cube = new THREE.Mesh(geometry,material);
        parent.add(cube);
        cube.position.set(Math.floor((Math.random() * 60) - 29),2.5,Math.floor((Math.random() * 60) - 29));
        console.log("adding cube");
    }
    
}


export {addPrimitiveMesh};