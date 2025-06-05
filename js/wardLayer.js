let wardLayerEnabled = false;
let wardLayer;

export function loadWardBoundaries(map) {
  fetch('data/ward_boundaries_2024.geojson')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (wardLayer) map.removeLayer(wardLayer);

      wardLayer = L.geoJSON(data, {
        style: {
          color: '#007BFF',
          weight: 1.5,
          opacity: 0.5,
          fillColor: '#007BFF',
          fillOpacity: 0.1
        },
        onEachFeature: function (feature, layer) {
          const ward = feature.properties?.ward ?? 'Unknown';
          layer.bindPopup(`<strong>Ward ${ward}</strong>`);
        }
      });

      wardLayer.addTo(map);
      wardLayerEnabled = true;
    })
    .catch(err => {
      console.error('Error loading ward boundaries:', err);
    });
}
