let wardLayerEnabled = false;
let wardLayer;
let selectedFeature = null;

export function toggleWardLayer(map, isOn) {
  // Remove the layer if it's already active
  if (!isOn) {
    if (wardLayer) map.removeLayer(wardLayer);
    wardLayerEnabled = false;
    selectedFeature = null;
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

      function resetStyle(layer) {
        wardLayer.resetStyle(layer);
      }

      function highlightFeature(e) {
        if (selectedFeature) {
          resetStyle(selectedFeature);
        }

        selectedFeature = e.target;

        selectedFeature.setStyle({
          weight: 3,
          color: '#003f88', //blue
          fillOpacity: 0.3
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          selectedFeature.bringToFront();
        }
      }

      wardLayer = L.geoJSON(data, {
        style: {
          color: '#9fa8b3', //grey
          weight: 1.5,
          opacity: 0.25,
          fillColor: '#9fa8b3', //grey
          fillOpacity: 0.15
        },
        onEachFeature: function (feature, layer) {
          const ward = feature.properties?.ward ?? 'Unknown';
          layer.bindPopup(`<strong>Ward ${ward}</strong>`);
          layer.on({ click: highlightFeature });
        }
      });

      wardLayer.addTo(map);
      wardLayerEnabled = true;

      // Reset highlight when clicking outside a ward
      map.on('click', function (e) {
        if (
          selectedFeature &&
          !e.originalEvent.target.closest('.leaflet-interactive')
        ) {
          resetStyle(selectedFeature);
          selectedFeature = null;
        }
      });
    })
    .catch(err => {
      console.error('Error loading ward boundaries:', err);
    });
}
