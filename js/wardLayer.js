let wardLayerEnabled = false;
let wardLayer; // Make sure this is defined globally

async function loadWardBoundaries(map) {
  const geojsonURL = './ward_boundaries_2024.geojson'; // Relative path

  try {
    const res = await fetch(geojsonURL);
    const data = await res.json();

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
    }).addTo(map);

    wardLayerEnabled = true;

  } catch (err) {
    console.error('Error loading ward boundaries:', err);
  }
}

function toggleWardLayer(map) {
  const isVisible = map.hasLayer(wardLayer);

  if (isVisible) {
    map.removeLayer(wardLayer);
    wardLayerEnabled = false;
  } else {
    if (!wardLayer) {
      loadWardBoundaries(map);
    } else {
      map.addLayer(wardLayer);
      wardLayerEnabled = true;
    }
  }
}
