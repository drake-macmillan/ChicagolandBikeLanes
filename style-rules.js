// js/style-rules.js
function getStyle(feature) {
  const type = feature.properties.displayrou;

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 3, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3, dashArray: "2,4" },
    "Painted Lane":               { color: "#e05b1d", weight: 1, dashArray: "2,4" },
    "2-way Mellow Route/Greenway":{ color: "#2547cf", weight: 2, dashArray: "4,4" },
    "1-way Mellow Route/Greenway":{ color: "#2547cf", weight: 1, dashArray: "4,4" },
    "Off-Street Trail/Path":      { color: "#2547cf", weight: 4, dashArray: null },
  };

  return styles[type] || { color: "#AAAAAA", weight: 1 };
}
