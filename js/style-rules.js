// js/style-rules.js
export function getStyle(feature) {
  const type = feature.properties.displayrou;

  const styles = {
    "Protected Bike Lane":        { color: "#2547cf", weight: 4, dashArray: null },
    "Painted Lane, Large":        { color: "#e05b1d", weight: 3.5, dashArray: "4,8" },
    "Painted Lane":               { color: "#e05b1d", weight: 1.5, dashArray: "4,8" },
    "2-way Mellow Route/Greenway":{ color: "#2547cf", weight: 3, dashArray: "4,4" },
    "1-way Mellow Route/Greenway":{ color: "#2547cf", weight: 2, dashArray: "4,4" },
    "Paved Trail":                { color: "#000080", weight: 4.5, dashArray: null },
    "Unpaved Trail":              { color: "#5A4B49", weight: 4.5, dashArray: null },
  };

  return styles[type] || { color: "#AAAAAA", weight: 1 };
}

export function addDirectionArrows(feature, layer, map) {
  if (feature.properties.br_oneway !== 'Y' || feature.geometry.type !== 'LineString') return;

  const color = getStyle(feature).color;

  const latlngs = feature.geometry.coordinates.map(([lng, lat]) => L.latLng(lat, lng));

  const decorator = L.polylineDecorator(latlngs, {
    patterns: [
      {
        offset: 0,
        repeat: '50px',
        symbol: L.Symbol.arrowHead({
          pixelSize: 8,
          polygon: false,
          pathOptions: {
            stroke: true,
            color: color,
            weight: 2,
            opacity: 0.8
          }
        })
      }
    ]
  });

  decorator.addTo(map);
}
