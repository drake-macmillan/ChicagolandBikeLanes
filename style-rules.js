// js/style-rules.js
function getStyle(feature) {
  const type = feature.properties.displayrou;

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 3, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3, dashArray: "2,4" },
    "Painted Lane":               { color: "#e05b1d", weight: 1, dashArray: "2,4" },
    "2-way Mellow Route/Greenway":{ color: "#2547cf", weight: 3, dashArray: "4,2" },
    "1-way Mellow Route/Greenway":{ color: "#2547cf", weight: 2, dashArray: "4,2" },
    "Off-Street Trail/Path":      { color: "#2547cf", weight: 4, dashArray: null },
  };

  return styles[type] || { color: "#AAAAAA", weight: 1 };
}

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
    className: '',  // optional: remove Leaflet default styling
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}
