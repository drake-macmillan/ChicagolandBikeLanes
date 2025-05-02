// Geocoder (search bar)
const geocoder = L.Control.geocoder('https://photon.komoot.io/api/', {
  defaultMarkGeocode: true,
  placeholder: 'Search', //originally said 'Search within Chicagoland' but I adjusted the boundaries so it's the continental US
  bounds: L.latLngBounds(
    L.latLng(24.5, -125),  // Southwest corner (near san diego)
    L.latLng(49.5, -66.9)   // Northeast corner (Maine-Canada border)
  )
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
  // Optional: just move map to the geocode result
  map.setView(e.geocode.center, 14); // or any zoom level you want
});


// Custom button controls
const buttonContainer = L.control({ position: 'topleft' });

buttonContainer.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-control-container');

  const googleBtn = L.DomUtil.create('button', 'custom-button', div);
  const googleIcon = L.DomUtil.create('img', '', googleBtn);
  googleIcon.src = 'images/google_maps_icon.webp';
  googleIcon.alt = 'Google Maps';
  googleBtn.onclick = () => {
    const center = map.getCenter();
    window.open(`https://www.google.com/maps?q=${center.lat},${center.lng}`, '_blank');
  };

  const divvyBtn = L.DomUtil.create('button', 'custom-button', div);
  const divvyIcon = L.DomUtil.create('img', '', divvyBtn);
  divvyIcon.src = 'images/divvy_logo.jpg';
  divvyIcon.alt = 'Divvy';
  divvyBtn.onclick = () => {
    console.log("Layer 1 button clicked");
  };

  const legendBtn = L.DomUtil.create('button', 'custom-button', div);
  const legendIcon = L.DomUtil.create('img', '', legendBtn);
  legendIcon.src = 'images/infoicon.jpg';
  legendIcon.alt = 'Legend';
  legendBtn.onclick = () => {
    const legend = document.getElementById('legend-popup');
    legend.style.display = (legend.style.display === 'none') ? 'block' : 'none';
  };

  return div;
};

buttonContainer.addTo(map);

