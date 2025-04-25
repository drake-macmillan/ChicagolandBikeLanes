// Geocoder (search bar)
const geocoder = L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(map);

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

// Trigger location request when searching
geocoder.on('markgeocode', function (e) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      locateControl.start();
    }, function (err) {
      console.error("Geolocation error: " + err.message);
    });
  }
});

// Custom button controls
const buttonContainer = L.control({ position: 'topleft' });

buttonContainer.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'custom-buttons');

  // Button: Open in Google Maps
  const googleBtn = L.DomUtil.create('button', 'leaflet-bar', div);
  googleBtn.innerHTML = "GoogleMaps";
  googleBtn.onclick = () => {
    const center = map.getCenter();
    window.open(`https://www.google.com/maps?q=${center.lat},${center.lng}`, '_blank');
  };

  // Button: Load Extra Layer 1
  const layerBtn1 = L.DomUtil.create('button', 'leaflet-bar', div);
  layerBtn1.innerHTML = "1";
  layerBtn1.onclick = () => {
    console.log("Layer 1 button clicked");
    // placeholder for future logic
  };

  // Button: Load Extra Layer 2
  const layerBtn2 = L.DomUtil.create('button', 'leaflet-bar', div);
  layerBtn2.innerHTML = "2";
  layerBtn2.onclick = () => {
    console.log("Layer 2 button clicked");
    // placeholder for future logic
  };

  // Button: Toggle Legend
  const legendBtn = L.DomUtil.create('button', 'leaflet-bar', div);
  legendBtn.innerHTML = "Legend";
  legendBtn.onclick = () => {
    const legend = document.getElementById('legend-popup');
    if (legend.style.display === 'none') {
      legend.style.display = 'block';
    } else {
      legend.style.display = 'none';
    }
  };

  return div;
};

buttonContainer.addTo(map);
