// divvyLayer.js
let divvyLayer = null;

async function loadDivvyStations(map) {
  const url = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json';

  try {
    const response = await fetch(url);
    const data = await response.json();
    const stations = data.data.stations;

    if (divvyLayer) {
      map.removeLayer(divvyLayer);
    }

    divvyLayer = L.layerGroup(
      stations.map(station =>
        L.circleMarker([station.lat, station.lon], {
          radius: 2,
          color: 'cyan',
          fillColor: '#00f',
          fillOpacity: 0.6
        }).bindPopup(`<strong>${station.name}</strong>`)
      )
    );

    divvyLayer.addTo(map);
  } catch (error) {
    console.error('Failed to load Divvy stations:', error);
  }
}

function toggleDivvyLayer(map) {
  if (divvyLayer) {
    if (map.hasLayer(divvyLayer)) {
      map.removeLayer(divvyLayer);
    } else {
      map.addLayer(divvyLayer);
    }
  } else {
    loadDivvyStations(map);
  }
}
