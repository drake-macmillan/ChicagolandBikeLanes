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

    const statusMap = {};
    stationStatus.forEach(station => {
      statusMap[station.station_id] = station;
    });

    if (divvyLayer) map.removeLayer(divvyLayer);
    if (ebikeLayer) map.removeLayer(ebikeLayer);

    divvyLayer = L.layerGroup(
      stationInfo.map(station => {
        const status = statusMap[station.station_id];

        const totalBikes = (status?.num_bikes_available ?? 0) - (status?.num_bikes_reserved ?? 0);
        const totalEbikes = (status?.num_ebikes_available ?? 0) - (status?.num_ebikes_reserved ?? 0);
        const classicBikes = totalBikes - totalEbikes;
        const docks = status?.num_docks_available ?? '?';

        const icon = L.divIcon({
          className: 'divvy-icon',
          html: `<div style="text-align:center; font-size: 15px; line-height:1.2; white-space: nowrap;">
                   🚲 ${totalBikes}<br>🅿️ ${docks}
                 </div>`,
          iconSize: [40, 25],
          iconAnchor: [20, 12]
        });

        return L.marker([station.lat, station.lon], { icon }).bindPopup(
          `<strong>${station.name}</strong><br>
           🛵 Electric Bikes: ${totalEbikes}<br>
           🚲 Classic Bikes: ${classicBikes}<br>
           🅿️ Docks Available: ${docks}`
        );
      })
    );
    divvyLayer.addTo(map);

    ebikeLayer = L.layerGroup(
      freeBikeData.data.bikes
        .filter(bike => bike.is_reserved === 0 && bike.is_disabled === 0)
        .map(bike =>
          L.marker([bike.lat, bike.lon], {
            icon: L.divIcon({
              className: 'ebike-icon',
              html: '🛵',
              iconSize: [7, 7]
            })
          }) // no popup to reduce mobile clutter
        )
    );
    ebikeLayer.addTo(map);
    
    
  // Adjust ebike visibility based on zoom level
    map.on('zoomend', function() {
      toggleEbikeVisibility(map);
    });

    // Initial check for ebike visibility when the map loads
    toggleEbikeVisibility(map);

  } catch (err) {
    console.error('Error loading Divvy data:', err);
  }
}

function toggleEbikeVisibility(map) {
  const zoomLevel = map.getZoom();

  // Set threshold zoom level for visibility
  const zoomThreshold = 7; // Adjust this based on your preference

  if (zoomLevel < zoomThreshold) {
    // If zoom is below threshold, remove ebikeLayer
    if (ebikeLayer) map.removeLayer(ebikeLayer);
  } else {
    // If zoom is above threshold, ensure ebikeLayer is visible
    if (ebikeLayer && !map.hasLayer(ebikeLayer)) {
      map.addLayer(ebikeLayer);
    }
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
