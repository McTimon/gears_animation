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
function getCoords(latitude, longitude){
    latitude_main = latitude;
    longitude_main = longitude;

    var map = L.map('mapid').setView([latitude_main, longitude_main], 13);
// var map = L.map('mapid').setView([5.700, -0.2], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
}