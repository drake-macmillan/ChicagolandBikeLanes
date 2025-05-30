// js/style-rules.js
function getStyle(feature) {
  const type = feature.properties.displayrou;

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 4, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3.5, dashArray: "4,8" },
    "Painted Lane":               { color: "#e05b1d", weight: 1.5, dashArray: "4,8" },
    "2-way Mellow Route/Greenway":{ color: "#2547cf", weight: 3, dashArray: "4,4" },
    "1-way Mellow Route/Greenway":{ color: "#2547cf", weight: 2, dashArray: "4,4" },
    "Off-Street Trail/Path":      { color: "#000080", weight: 4.5, dashArray: null },
  };

  return styles[type] || { color: "#AAAAAA", weight: 1 };
}

// Function to decorate lines with arrows for one-way segments
function decorateIfOneWay(feature, layer) {
  if (feature.properties.br_oneway === "Y") {
    const color = getStyle(feature).color;

    // Make sure layer._map is ready, fallback to global map variable
    const mapInstance = layer._map || window.map;

    if (!mapInstance) {
      console.warn('Map instance not found for decorating polyline');
      return;
    }

    const decorator = L.polylineDecorator(layer, {
      patterns: [
        {
          offset: '5%',
          repeat: '10%',
          symbol: L.Symbol.arrowHead({
            pixelSize: 10,
            polygon: false,
            pathOptions: { stroke: true, color: color }
          })
        }
      ]
    });

    decorator.addTo(mapInstance);
  }
}


// all this stuff below will be eventually deleted
// i have been handling one way trails by manually adding dots that render as arrows
// currently i am adding code to stylistically add one way lines based on metadata
// once that works I can delete all the below code

function getArrowIcon(feature) {
  const label = feature.properties.label;

  // Unicode arrow symbols
  const arrows = {
    N: '↑', NE: '↗', E: '→', SE: '↘',
    S: '↓', SW: '↙', W: '←', NW: '↖'
  };

  const arrow = arrows[label] || '•';

  return L.divIcon({
    html: `<div style="font-size: 20px; transform: rotate(0deg);">${arrow}</div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

// Global arrow layer to toggle based on zoom level
let arrowLayer = null;

// Function to load arrows and store them in the global layer
function loadArrowLayer(map) {
  fetch('data/direction_arrows.json')
    .then(response => response.json())
    .then(data => {
      arrowLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: getArrowIcon(feature) });
        }
      });

      // Add it only if zoom is high enough
      if (map.getZoom() >= 14) {
        arrowLayer.addTo(map);
      }

      // Set up zoom listener for showing/hiding
      map.on('zoomend', function () {
        if (!arrowLayer) return;
        if (map.getZoom() >= 15) {
          if (!map.hasLayer(arrowLayer)) map.addLayer(arrowLayer);
        } else {
          if (map.hasLayer(arrowLayer)) map.removeLayer(arrowLayer);
        }
      });
    });
}
