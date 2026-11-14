import { map } from './init-map.js';
import { addMapControls } from './map-controls.js';
import { getStyle } from './style-rules.js';
import { loadDivvyStations } from './divvyLayer.js';

function loadBikeLanes() {
  fetch('data/2026-11-13-bikeways.json')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: getStyle,
        onEachFeature: function(feature, layer) {
          layer.on('click', function(e) {
            console.log('Feature clicked:', feature.properties);
          });
        }
      }).addTo(map);
    });
}

function main(){
  loadBikeLanes();
  addMapControls(map);
}

main();
