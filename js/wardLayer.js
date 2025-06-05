let wardLayerEnabled = false;
let wardLayer;

export function toggleWardLayer(map, isOn) {
  // Remove the layer if it's already active
  if (!isOn) {
    if (wardLayer) map.removeLayer(wardLayer);
    wardLayerEnabled = false;
    return;
  }
  
  // Load and add the layer
  fetch('data/ward_boundaries_2024.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (wardLayer) map.removeLayer(wardLayer);

      function resetStyle(e) {
        wardLayer.resetStyle(e.target);
      }

      function highlightFeature(e) {
        e.target.setStyle({
          weight: 3,
          color: '#003f88',
          fillOpacity: 0.2
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          e.target.bringToFront();
        }
      }

      wardLayer = L.geoJSON(data, {
        style: {
          color: '#9fa8b3',
          weight: 1.5,
          opacity: 0.1,
          fillColor: '#9fa8b3',
          fillOpacity: 0.05
        },
        onEachFeature: function (feature, layer) {
          const ward = feature.properties?.ward ?? 'Unknown';
          layer.bindPopup(`<strong>Ward ${ward}</strong>`);

          layer.on({
            click: highlightFeature,
            mouseout: resetStyle
          });
        }
      });

      wardLayer.addTo(map);
      wardLayerEnabled = true;
    })
    .catch(err => {
      console.error('Error loading ward boundaries:', err);
    });
}
