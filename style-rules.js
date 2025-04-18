// js/style-rules.js
function getStyle(feature) {
  const type = feature.properties.displayrou;

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 4, dashArray: null },
    "Painted Lane, Large":        { color: "#c9ba2c", weight: 3 },
    "Painted Lane":               { color: "#e05b1d", weight: 2, dashArray: "4,4" },
    "2-way Mellow Route/Greenway":{ color: "#44a832", weight: 3, dashArray: "1,6" },
    "1-way Mellow Route/Greenway":{ color: "#44a832", weight: 2, dashArray: "1,6" },
    "Off-Street Trail/Path":      { color: "#44a832", weight: 4, dashArray: "1,6" },
  };

  return styles[type] || { color: "#AAAAAA", weight: 1 };
}
