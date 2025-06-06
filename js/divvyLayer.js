let stationLayer = null;
let ebikeLayer = null;
let dotLayer = null;
let divvyLayerEnabled = false;

export async function loadDivvyStations(map) {
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

    if (stationLayer) map.removeLayer(stationLayer);
    if (ebikeLayer) map.removeLayer(ebikeLayer);
    if (dotLayer) map.removeLayer(dotLayer);

    stationLayer = L.layerGroup(
      stationInfo.map(station => {
        const status = statusMap[station.station_id];

        const totalBikes = (status?.num_bikes_available ?? 0) - (status?.num_bikes_reserved ?? 0);
        const totalEbikes = (status?.num_ebikes_available ?? 0) - (status?.num_ebikes_reserved ?? 0);
        const classicBikes = totalBikes - totalEbikes;
        const docks = status?.num_docks_available ?? '?';

        const icon = L.divIcon({
          className: 'divvy-icon',
          html: `<div class="divvy-icon-content">
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

    dotLayer = L.layerGroup(
      stationInfo.map(station =>
        L.circleMarker([station.lat, station.lon], {
          radius: 4,
          color: '#007BFF',
          fillColor: '#007BFF',
          fillOpacity: 0.7,
          weight: 0
        })
      )
    );

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
          })
        )
    );

    divvyLayerEnabled = true;
    toggleStationVisibility(map);
    toggleEbikeVisibility(map);

    map.off('zoomend', handleZoomChange);
    map.on('zoomend', handleZoomChange);

  } catch (err) {
    console.error('Error loading Divvy data:', err);
  }
}

export function handleZoomChange(e) {
  const map = e.target;
  if (divvyLayerEnabled) {
    toggleStationVisibility(map);
    toggleEbikeVisibility(map);
  }
}

export function toggleStationVisibility(map) {
  const zoomLevel = map.getZoom();
  const zoomThreshold = 15;

  if (zoomLevel < zoomThreshold) {
    if (stationLayer && map.hasLayer(stationLayer)) map.removeLayer(stationLayer);
    if (dotLayer && !map.hasLayer(dotLayer)) map.addLayer(dotLayer);
  } else {
    if (dotLayer && map.hasLayer(dotLayer)) map.removeLayer(dotLayer);
    if (stationLayer && !map.hasLayer(stationLayer)) map.addLayer(stationLayer);
  }
}

export function toggleEbikeVisibility(map) {
  const zoomLevel = map.getZoom();
  const zoomThreshold = 15;

  if (zoomLevel < zoomThreshold) {
    if (ebikeLayer && map.hasLayer(ebikeLayer)) map.removeLayer(ebikeLayer);
  } else {
    if (ebikeLayer && !map.hasLayer(ebikeLayer)) map.addLayer(ebikeLayer);
  }
}

export function toggleDivvyLayer(map) {
  const isVisible =
    (stationLayer && map.hasLayer(stationLayer)) ||
    (dotLayer && map.hasLayer(dotLayer)) ||
    (ebikeLayer && map.hasLayer(ebikeLayer));

  if (isVisible) {
    if (stationLayer) map.removeLayer(stationLayer);
    if (dotLayer) map.removeLayer(dotLayer);
    if (ebikeLayer) map.removeLayer(ebikeLayer);
    divvyLayerEnabled = false;
  } else {
    if (!stationLayer || !dotLayer || !ebikeLayer) {
      loadDivvyStations(map);
    } else {
      divvyLayerEnabled = true;
      toggleStationVisibility(map);
      toggleEbikeVisibility(map);
    }
  }
}

