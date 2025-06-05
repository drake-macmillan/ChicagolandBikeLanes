let wardLayerEnabled = false;
let wardLayer;

export async function loadWardBoundaries(map) {
  const geojsonURL = './ward_boundaries_2024.geojson';

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
    });

  } catch (err) {
    console.error('Error loading ward boundaries:', err);
  }
}
