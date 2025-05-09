// divvyLayer.js
let divvyStationLayer = null;
let divvyEbikesLayer = null;

async function loadDivvyStations(map) {
  const infoUrl = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json';
  const statusUrl = 'https://gbfs.divvybikes.com/gbfs/en/station_status.json';

  try {
    const [infoResponse, statusResponse] = await Promise.all([
      fetch(infoUrl),
      fetch(statusUrl)
    ]);

    const infoData = await infoResponse.json();
    const statusData = await statusResponse.json();

    const stations = infoData.data.stations;
    const statusMap = Object.fromEntries(
      statusData.data.stations.map(s => [s.station_id, s])
    );

    if (divvyStationLayer) {
      map.removeLayer(divvyStationLayer);
    }

    divvyStationLayer = L.layerGroup(
      stations.map(station => {
        const status = statusMap[station.station_id];
        const ebikes = status?.num_ebikes_available ?? 0;
        const totalBikes = status?.num_bikes_available ?? 0;
        const classicBikes = totalBikes - ebikes;
        const docks = status?.num_docks_available ?? 'N/A';

        return L.circleMarker([station.lat, station.lon], {
          radius: 4,
          color: 'cyan',
          fillColor: '#00f',
          fillOpacity: 0.6
        }).bindPopup(`
          <strong>${station.name}</strong><br>
          ⚡ Electric Bikes: ${ebikes}<br>
          🚲 Classic Bikes: ${classicBikes}<br>
          🅿️ Docks Available: ${docks}
        `);
      })
    );

    divvyStationLayer.addTo(map);

  } catch (error) {
    console.error('Failed to load Divvy station data:', error);
  }
}

async function loadDivvyEbikes(map) {
  const url = 'https://gbfs.divvybikes.com/gbfs/en/free_bike_status.json';

  try {
    const response = await fetch(url);
    const data = await response.json();
    const bikes = data.data.bikes;

    if (divvyEbikesLayer) {
      map.removeLayer(divvyEbikesLayer);
    }

    divvyEbikesLayer = L.layerGroup(
      bikes.map(bike =>
        L.marker([bike.lat, bike.lon], {
          icon: L.divIcon({
            className: 'ebike-icon',
            html: '⚡',
            iconSize: [20, 20]
          })
        }).bindPopup(`<strong>Free-floating E-Bike</strong><br>ID: ${bike.bike_id}`)
      )
    );

    divvyEbikesLayer.addTo(map);
  } catch (error) {
    console.error('Failed to load free-floating e-bikes:', error);
  }
}

function toggleDivvyLayer(map) {
  const anyLayerVisible =
    (divvyStationLayer && map.hasLayer(divvyStationLayer)) ||
    (divvyEbikesLayer && map.hasLayer(divvyEbikesLayer));

  if (anyLayerVisible) {
    if (divvyStationLayer) map.removeLayer(divvyStationLayer);
    if (divvyEbikesLayer) map.removeLayer(divvyEbikesLayer);
  } else {
    if (!divvyStationLayer) loadDivvyStations(map); else map.addLayer(divvyStationLayer);
    if (!divvyEbikesLayer) loadDivvyEbikes(map); else map.addLayer(divvyEbikesLayer);
  }
}
