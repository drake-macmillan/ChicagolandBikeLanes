import { toggleWardLayer } from './wardLayer.js';
import { toggleDivvyLayer } from './divvyLayer.js';

export function addMapControls(map){
  
// Geocoder (search bar)
const geocoder = L.Control.geocoder('https://photon.komoot.io/api/', {
  defaultMarkGeocode: true,
  placeholder: 'Search', //originally said 'Search within Chicagoland' but I adjusted the boundaries so it's the continental US
  bounds: L.latLngBounds(
    L.latLng(24.5, -125),  // Southwest corner (near san diego)
    L.latLng(49.5, -66.9)   // Northeast corner (Maine-Canada border)
  )
}).addTo(map);

// Custom button controls
const buttonContainer = L.control({ position: 'topleft' });

buttonContainer.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-control-container');

  // Divvy Button
  const divvyBtn = L.DomUtil.create('button', 'custom-button', div);
  const divvyIcon = L.DomUtil.create('img', '', divvyBtn);
  divvyIcon.src = 'images/divvy_logo.jpg';
  divvyIcon.alt = 'Divvy';
  divvyBtn.onclick = () => {
    toggleDivvyLayer(map);
  };

  // Legend Button
  const legendBtn = L.DomUtil.create('button', 'custom-button', div);
  const legendIcon = L.DomUtil.create('img', '', legendBtn);
  legendIcon.src = 'images/infoicon.jpg';
  legendIcon.alt = 'Legend';
  legendBtn.onclick = (e) => {
    const legend = document.getElementById('legend-popup');
    const isVisible = legend.style.display === 'block';
    if (!isVisible) {
      // Position the legend relative to the button
      const rect = legendBtn.getBoundingClientRect();
      legend.style.left = `${rect.right + 10}px`;
      legend.style.top = `${rect.top}px`;
    }
    legend.style.display = isVisible ? 'none' : 'block';
  };

  // More Options Button
  const moreBtn = L.DomUtil.create('button', 'custom-button', div);
  moreBtn.innerHTML = '&#9776;';
  moreBtn.title = "More options";

  const dropdown = L.DomUtil.create('div', 'custom-dropdown hidden', div);

  const addDropdownSeparator = () => {
    const hr = document.createElement('hr');
    hr.className = 'dropdown-separator';
    dropdown.appendChild(hr);
  };
  
  const addDropdownOption = (label, onClick, isToggle = false) => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = label;
    if (isToggle) {
      item.dataset.active = "false";
      item.onclick = () => {
        item.dataset.active = item.dataset.active === "true" ? "false" : "true";
        item.classList.toggle('active');
        onClick(item.dataset.active === "true");
      };
    } else {
      item.onclick = () => {
        onClick();
        dropdown.classList.add('hidden');
      };
    }
    dropdown.appendChild(item);
  };

  addDropdownOption("(Upcoming Projects)", (isOn) => {
   toggleDivvyLayer(map);
  }, true);

  addDropdownOption("Chicago Ward Boundaries", (isOn) => {
    toggleWardLayer(map, isOn);
  }, true);
  
  addDropdownOption("(CTA/Metra)", (isOn) => {
    console.log("Upcoming Projects toggled:", isOn);
    toggleCTAMetraLayer(map, isOn);
  }, true);

  addDropdownSeparator();
  
  addDropdownOption("Open in Google Maps", () => {
    const center = map.getCenter();
    window.open(`https://www.google.com/maps?q=${center.lat},${center.lng}`, '_blank');
  });
  
  addDropdownOption("Open in Apple Maps", () => {
    const center = map.getCenter();
    window.open(`https://maps.apple.com/?q=${center.lat},${center.lng}`, '_blank');
  }, );

  addDropdownSeparator();
  
  addDropdownOption("(Contact Me)", () => {
    console.log("Contact Me:", isOn);
  }, true);
    
  moreBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  };

  // Hide dropdown if clicking outside
  document.addEventListener('click', (event) => {
    if (!div.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  });

  return div;
};

buttonContainer.addTo(map);

}

