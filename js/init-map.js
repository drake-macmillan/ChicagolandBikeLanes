// init-map.js

// Initialize the Leaflet map and center it on Chicago
const map = L.map('map', { zoomControl: false }).setView([41.8781, -87.6298], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
  opacity: 0.3  // 0 = fully transparent, 1 = fully opaque
}).addTo(map);

// Optional: expose the map globally if other scripts need to access it
window.map = map;

// Show user's live location with direction
if (navigator.geolocation) {
  let userMarker;
  const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: `<div class="user-direction-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const heading = position.coords.heading;

      if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
        map.setView([lat, lng], 14);
      } else {
        userMarker.setLatLng([lat, lng]);
      }

      // Rotate the icon if heading is available
      if (!isNaN(heading)) {
        const dot = userMarker.getElement().querySelector('.user-direction-dot');
        if (dot) dot.style.transform = `rotate(${heading}deg)`;
      }
    },
    (error) => {
      console.warn("Geolocation failed or was denied:", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
} else {
  console.warn("Geolocation is not supported by this browser.");
}
