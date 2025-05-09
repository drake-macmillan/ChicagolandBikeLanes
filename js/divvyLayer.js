// divvyLayer.js
let divvyLayer = null;
let ebikeLayer = null;

async function loadDivvyStations(map) {
  const infoURL = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json';
  const statusURL = 'https://gbfs.divvybikes.com/gbfs/en/station_status.json';
  const freeBikeURL = 'https://gbfs.divvybikes.com/gbfs/en/free_bike_status.json';

  try {
    const [infoRes, statusRes, freeBikeRes] = await Promise.all([
      fetch(infoURL),
      fetch(statusURL),
      fetch(freeBikeURL)
    ]);

    const stationInfo = (await infoRes.json()).data.stations;
    const stationStatus = (await statusRes.json()).data.stations;
    const freeBikeData = await freeBikeRes.json();

    // Create a lookup table for station status
    const statusMap = {};
    stationStatus.forEach(station => {
      statusMap[station.station_id] = station;
    });

    if (divvyLayer) map.removeLayer(divvyLayer);
    if (ebikeLayer) map.removeLayer(ebikeLayer);

    // Docked station markers
    divvyLayer = L.layerGroup(
      stationInfo.map(station => {
        const status = statusMap[station.station_id];
        const bikes = status?.num_bikes_available ?? '?';
        const docks = status?.num_docks_available ?? '?';
        const ebikes = status?.num_ebikes_available ?? 0;
        const classicBikes = bikes - ebikes;

        const icon = L.divIcon({
          className: 'divvy-icon',
          html: `<div style="text-align:center; font-size: 10px; line-height:1.2;">
                   🚲 ${bikes}<br>🅿️ ${docks}
                 </div>`,
          iconSize: [40, 25],
          shadowSize:   [50, 64],
          iconAnchor: [20, 12],
          shadowAnchor: [4, 62],

        });

        return L.marker([station.lat, station.lon], { icon }).bindPopup(
          `<strong>${station.name}</strong><br>
           🛵 Electric Bikes: ${ebikes}<br>
           🚲 Classic Bikes: ${classicBikes}<br>
           🅿️ Docks Available: ${docks}`
        );
      })
    );
    divvyLayer.addTo(map);

    // Free-floating e-bikes
    ebikeLayer = L.layerGroup(
      freeBikeData.data.bikes
        .filter(bike => bike.is_reserved === 0 && bike.is_disabled === 0)
        .map(bike =>
          L.marker([bike.lat, bike.lon], {
            icon: L.divIcon({
              className: 'ebike-icon',
              html: '🛵',
              iconSize: [10, 10]
            })
          }).bindPopup(`<strong>Electric Bike</strong><br>Range: ${bike.current_range_meters ? (bike.current_range_meters / 1609.34).toFixed(1) + ' mi' : 'N/A'}<br>
  Last Reported: ${bike.last_reported ? new Date(bike.last_reported * 1000).toLocaleString() : 'N/A'}<br>`)
        )
    );
    ebikeLayer.addTo(map);

  } catch (err) {
    console.error('Error loading Divvy data:', err);
  }
}

function toggleDivvyLayer(map) {
  const visible = divvyLayer && map.hasLayer(divvyLayer);
  if (visible) {
    if (divvyLayer) map.removeLayer(divvyLayer);
    if (ebikeLayer) map.removeLayer(ebikeLayer);
  } else {
    if (!divvyLayer || !ebikeLayer) {
      loadDivvyStations(map);
    } else {
      map.addLayer(divvyLayer);
      map.addLayer(ebikeLayer);
    }
  }
}
