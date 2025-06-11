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

export function addDirectionArrows(feature, map) {
  if (feature.properties.br_oneway !== 'Y' || feature.geometry.type !== 'LineString') return;

  const coords = feature.geometry.coordinates;
  const color = getStyle(feature).color;

  const arrowSpacing = 5; // approx. every 5th point
  const arrowSize = 0.00005; // smaller = shorter arrow lines

  for (let i = 1; i < coords.length; i += arrowSpacing) {
    const [x1, y1] = coords[i - 1];
    const [x2, y2] = coords[i];
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const tip = L.latLng(y2, x2);

    const leftWing = L.latLng(
      y2 - arrowSize * Math.sin(angle - Math.PI / 6),
      x2 - arrowSize * Math.cos(angle - Math.PI / 6)
    );
    const rightWing = L.latLng(
      y2 - arrowSize * Math.sin(angle + Math.PI / 6),
      x2 - arrowSize * Math.cos(angle + Math.PI / 6)
    );

    const arrow = L.polyline([leftWing, tip, rightWing], {
      color: color,
      weight: 2,
      interactive: false,
      pane: 'shadowPane' // draw arrows under labels if any
    });

    arrow.addTo(map);
  }
}
