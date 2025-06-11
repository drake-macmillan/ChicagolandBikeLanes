import { map } from './init-map.js';
import { addMapControls } from './map-controls.js';
import { getStyle, addDirectionArrows } from './style-rules.js';
import { loadDivvyStations } from './divvyLayer.js';

function loadBikeLanes() {
  fetch('data/chicagoland_bikeways_jun10.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: getStyle,
        onEachFeature: (feature, layer) => {
          addDirectionArrows(feature, layer, map);
        }
      }).addTo(map);
    });
}

function main(){
  loadBikeLanes();
  addMapControls(map);
}

main();
