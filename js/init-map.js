// init-map.js

// Initialize the Leaflet map and center it on Chicago
const map = L.map('map', { zoomControl: false }).setView([41.8781, -87.6298], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Attempt to locate the user and show their location on the map
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLatLng = [position.coords.latitude, position.coords.longitude];
      L.marker(userLatLng, {
        title: "Your Location",
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(map);
      map.setView(userLatLng, 14); // Zoom to user location
    },
    (error) => {
      console.warn("Geolocation failed or was denied:", error.message);
    }
  );
} else {
  console.warn("Geolocation is not supported by this browser.");
}

// Optional: expose the map globally if other scripts need to access it
window.map = map;
