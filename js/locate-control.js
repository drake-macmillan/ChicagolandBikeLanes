// Add persistent location button
const locateControl = L.control.locate({
  position: 'topleft',
  drawCircle: true,
  keepCurrentZoomLevel: true,
  strings: {
    title: "Show me where I am"
  },
  locateOptions: {
    enableHighAccuracy: true
  }
}).addTo(map);
