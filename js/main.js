function loadBikeLanes() {
  fetch('data/chicagoland_bikeways_10may25.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: getStyle,
      }).addTo(map); // map comes from init-map.js
    });
}

function main(){
  loadBikeLanes();
  addMapControls(map);
}

main();
