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
  try {
    if (
      feature.properties.br_oneway !== 'Y' ||
      feature.geometry.type !== 'LineString'
    ) {
      return;
    }

    const color = getStyle(feature).color;
    const latlngs = feature.geometry.coordinates.map(([lng, lat]) =>
      L.latLng(lat, lng)
    );

    // Create the polyline and add it to the map
    const line = L.polyline(latlngs, {
      color: color,
      weight: 2,
      opacity: 0 // hide the base line since it's already drawn via geoJSON
    }).addTo(map);

    // Add the arrow decorator
    const arrowHead = L.polylineDecorator(line, {
      patterns: [{
        offset: '100%',
        repeat: 0,
        symbol: L.Symbol.arrowHead({
          pixelSize: 15,
          polygon: false,
          pathOptions: {
            stroke: true,
            color: color,
            weight: 2
          }
        })
      }]
    });

    arrowHead.addTo(map);
  } catch (error) {
    console.warn('Arrow rendering failed for a feature:', error);
  }
}

