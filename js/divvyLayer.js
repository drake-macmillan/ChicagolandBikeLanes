// divvyLayer.js
let divvyLayer = null;

async function loadDivvyStations(map) {
  const infoURL = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json';
  const statusURL = 'https://gbfs.divvybikes.com/gbfs/en/station_status.json';

  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch(infoURL),
      fetch(statusURL)
    ]);

    const stationInfo = (await infoRes.json()).data.stations;
    const stationStatus = (await statusRes.json()).data.stations;

    // Index status by station_id for quick lookup
    const statusMap = {};
    stationStatus.forEach(station => {
      statusMap[station.station_id] = station;
    });

    // Remove old layer if exists
    if (divvyLayer) {
      map.removeLayer(divvyLayer);
    }

    // Create new layer
    divvyLayer = L.layerGroup(
      stationInfo.map(station => {
        const status = statusMap[station.station_id];

        const bikes = status?.num_bikes_available ?? '?';
        const docks = status?.num_docks_available ?? '?';

        const icon = L.divIcon({
          className: 'divvy-icon',
          html: `<div style="text-align:center; font-size: 10px; line-height:1.2;">
                   🚲 ${bikes}<br>⛔ ${docks}
                 </div>`,
          iconSize: [40, 25],
          iconAnchor: [20, 12]
        });

        return L.marker([station.lat, station.lon], { icon }).bindPopup(
          `<strong>${station.name}</strong><br>
           🚲 Bikes available: ${bikes}<br>
           ⛔ Docks available: ${docks}`
        );
      })
    );

    divvyLayer.addTo(map);
  } catch (err) {
    console.error('Error loading Divvy data:', err);
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
