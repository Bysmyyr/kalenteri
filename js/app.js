// Advent Calendar Map Application
(function() {
  'use strict';

  // Default image to use when no image is specified
  const DEFAULT_IMAGE = "img/default.png";

  // Locations configuration (edit these to customize your advent calendar)
  // All locations in Littoinen, Finland area
  let locations = [
    //{
    //  day: 1,
    //  name: "Esimerkkikohde",
    //  description: "Lisää kuvaus tähän.",
    //  image: "", // Jätä tyhjäksi käyttääksesi oletuskuvaa
    //  lat: 60.4862,
    //  lng: 22.3812
    //}
  ];

  // Initialize map
  let map;
  let markers = [];
  let activeMarker = null;

  // Create custom Christmas tree icon
  const christmasTreeIcon = L.divIcon({
    html: '<div style="font-size: 32px;">🎄</div>',
    className: 'christmas-tree-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const defaultIcon = new L.Icon.Default();

  function initMap() {
    // Create map centered on Littoisten Verkatehdas with autoPan options
    // Coordinates: N=6710372.038, E=247233.694 (ETRS-TM35FIN)
    map = L.map('map', {
      autoPanOnFocus: true,
      autoPan: true
    }).setView([60.4502, 22.4112], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add markers for all locations
    updateMapMarkers();
  }

  function updateMapMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Get current date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed, so December is 11, November is 10

    // Don't show anything in November
    if (currentMonth === 10) return;

    // Determine which days to show
    // December: show up to current day
    // Other months: show all 24 days
    const maxDay = (currentMonth === 11) ? currentDay : 24;

    // Add new markers only for available days
    locations.forEach(location => {
      // Skip future days
      if (location.day > maxDay) return;

      const marker = L.marker([location.lat, location.lng])
        .addTo(map);

      // Store location data with marker
      marker.locationDay = location.day;

      // Add click handler to marker
      marker.on('click', () => {
        setActiveLocation(location.day);
      });

      markers.push(marker);
    });
  }

  function setActiveLocation(day, updateUrl = true) {
    const location = locations.find(loc => loc.day === day);
    if (!location) return;

    // Reset previous active marker to default icon
    if (activeMarker) {
      activeMarker.setIcon(defaultIcon);
    }

    // Find and set new active marker
    markers.forEach(marker => {
      if (marker.locationDay === day) {
        marker.setIcon(christmasTreeIcon);
        activeMarker = marker;
      }
    });

    // Zoom to location
    map.setView([location.lat, location.lng], 16);

    // Scroll to map section (make map top align with screen top)
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update URL hash
    if (updateUrl) {
      window.history.pushState(null, '', `#day-${day}`);
    }

    // Move card to top
    moveCardToTop(day);
  }

  function moveCardToTop(day) {
    const listContainer = document.getElementById('locationsList');

    // Remove any existing highlighted card at the top
    const existingHighlight = listContainer.querySelector('.highlighted-card');
    if (existingHighlight) {
      existingHighlight.remove();
    }

    // Find the location data
    const location = locations.find(loc => loc.day === day);
    if (!location) return;

    // Create a copy of the card
    const highlightedCard = document.createElement('div');
    highlightedCard.className = 'location-card highlighted-card';
    highlightedCard.dataset.day = location.day;
    const imageUrl = location.image || DEFAULT_IMAGE;
    highlightedCard.innerHTML = `
      <img src="${imageUrl}" alt="${location.name}" class="card-image">
      <div class="card-content">
        <div class="day-badge">${location.day}</div>
        <h3>${location.name}</h3>
        <div class="date">${location.day}. joulukuuta 2025</div>
        <div class="description">${location.description}</div>
      </div>
    `;

    // Add click handler to the highlighted card
    highlightedCard.addEventListener('click', () => {
      setActiveLocation(location.day);
    });

    // Insert at the top
    listContainer.insertBefore(highlightedCard, listContainer.firstChild);
  }

  function renderLocationsList() {
    const listContainer = document.getElementById('locationsList');

    // Get current date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed, so December is 11, November is 10

    // Don't show anything in November
    if (currentMonth === 10) {
      listContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">Joulukalenteri avautuu joulukuussa! 🎄</p>';
      return;
    }

    // Determine which days to show
    // December: show up to current day
    // Other months: show all 24 days
    const maxDay = (currentMonth === 11) ? currentDay : 24;

    // Sort locations by day and filter to show only available days
    const sortedLocations = [...locations]
      .filter(loc => loc.day <= maxDay)
      .sort((a, b) => a.day - b.day);

    listContainer.innerHTML = sortedLocations.map(location => {
      const imageUrl = location.image || DEFAULT_IMAGE;
      return `
        <div class="location-card" data-day="${location.day}">
          <img src="${imageUrl}" alt="${location.name}" class="card-image">
          <div class="day-badge">${location.day}</div>
          <h3>${location.name}</h3>
          <div class="date">${location.day}. joulukuuta 2025</div>
          <div class="description">${location.description}</div>
        </div>
      `;
    }).join('');

    // Add click handlers for cards
    document.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const day = parseInt(card.dataset.day);
        setActiveLocation(day);
      });
    });
  }

  // Check URL hash and activate location
  function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#day-')) {
      const day = parseInt(hash.replace('#day-', ''));
      if (day >= 1 && day <= 24) {
        setTimeout(() => {
          setActiveLocation(day, false); // Don't update URL since we're loading from it
        }, 500);
        return true;
      }
    }
    return false;
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderLocationsList();

    // Check if URL has a hash to load specific day
    const hasHash = checkUrlHash();

    // Auto-select current date location if no hash in URL
    if (!hasHash) {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth(); // 0-indexed, so December is 11, November is 10

      // Auto-select current day in December (1-24)
      if (currentMonth === 11 && currentDay >= 1 && currentDay <= 24) {
        setTimeout(() => {
          setActiveLocation(currentDay);
        }, 500);
      }
      // In other months (except November), default to day 1
      else if (currentMonth !== 10) {
        setTimeout(() => {
          setActiveLocation(1);
        }, 500);
      }
    }
  });

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    checkUrlHash();
  });

})();
