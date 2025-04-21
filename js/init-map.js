// init-map.js

// Initialize the Leaflet map and center it on Chicago
const map = L.map('map').setView([41.8781, -87.6298], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Optional: expose the map globally if other scripts need to access it
window.map = map;
