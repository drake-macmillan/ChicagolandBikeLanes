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

// Optional: Prevent re-prompting if already granted
if (localStorage.getItem('location-granted') !== 'true') {
  locateControl.start();
  localStorage.setItem('location-granted', 'true');
}

