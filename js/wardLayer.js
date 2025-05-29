let wardLayer;

export function toggleWardBoundariesLayer(map, isOn) {
  if (isOn) {
    if (!wardLayer) {
      fetch('ward_boundaries_2024.geojson')
        .then(response => response.json())
        .then(data => {
          wardLayer = L.geoJSON(data, {
            style: {
              color: '#003366',
              weight: 2,
              fillOpacity: 0.1
            }
          }).addTo(map);
        })
        .catch(err => console.error('Failed to load ward boundaries:', err));
    } else {
      wardLayer.addTo(map);
    }
  } else {
    if (wardLayer) {
      map.removeLayer(wardLayer);
    }
  }
}
