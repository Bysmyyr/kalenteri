// Advent Calendar Map Application
(function() {
  'use strict';

  // Default image to use when no image is specified
  const DEFAULT_IMAGE = "img/default.png";

  // Locations configuration (edit these to customize your advent calendar)
  // All locations in Littoinen, Finland area
  // Optional preview fields (shown before the date arrives):
  //   - previewDescription: Show this description before the date arrives
  //   - previewImage: Show this image before the date arrives (optional, uses same image if not set)
  let locations = [
    //{
    //  day: 24,
    //  description: "Viimeinen luukku! Tule viettämään jouluaattoa kanssamme.",
    //  image: "",
    //  previewDescription: "Jotain erityistä odottaa! Avautuu 24. joulukuuta.",
    //  previewImage: "", // Optional: different image for preview
    //  lat: 60.4502,
    //  lng: 22.4112
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

  // Helper function to check if a location should show preview content
  function shouldShowPreview(location) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    // Before December or in December before the day: show preview if preview description exists
    if (currentMonth < 11 || (currentMonth === 11 && currentDay < location.day)) {
      return location.previewDescription;
    }
    return false;
  }

  function updateMapMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Get current date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed, so December is 11, November is 10

    // Add new markers for locations
    locations.forEach(location => {
      // Show if:
      // - In December and day has arrived, OR
      // - Has preview content (shown in any month before the day)
      const dayHasArrived = currentMonth === 11 && location.day <= currentDay;
      const hasPreview = shouldShowPreview(location);

      if (!dayHasArrived && !hasPreview) return;

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

    // Determine if we should show preview content
    const showPreview = shouldShowPreview(location);

    // Select content to display
    const displayDescription = showPreview && location.previewDescription ? location.previewDescription : location.description;
    // Use previewImage if showing preview and it's set, otherwise use regular image
    let imageUrl;
    if (showPreview && location.previewImage) {
      imageUrl = location.previewImage;
    } else {
      imageUrl = location.image || DEFAULT_IMAGE;
    }
    // Apply default if still empty
    if (!imageUrl) imageUrl = DEFAULT_IMAGE;

    // Create a copy of the card
    const highlightedCard = document.createElement('div');
    highlightedCard.className = 'location-card highlighted-card';
    highlightedCard.dataset.day = location.day;
    highlightedCard.innerHTML = `
      <img src="${imageUrl}" alt="Luukku ${location.day}" class="card-image">
      <div class="card-content">
        <div class="day-badge">${location.day}</div>
        <div class="date">${location.day}. joulukuuta 2025</div>
        <div class="description">${displayDescription}</div>
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

    // Filter locations to show
    const sortedLocations = [...locations]
      .filter(loc => {
        // Show if:
        // - In December and day has arrived, OR
        // - Has preview content (shown in any month before the day)
        const dayHasArrived = currentMonth === 11 && loc.day <= currentDay;
        const hasPreview = shouldShowPreview(loc);
        return dayHasArrived || hasPreview;
      })
      .sort((a, b) => a.day - b.day);

    // If no locations to show, display message
    if (sortedLocations.length === 0) {
      listContainer.innerHTML = '<p style="text-align: center; color: #718096; padding: 2rem;">Joulukalenteri avautuu joulukuussa! 🎄</p>';
      return;
    }

    listContainer.innerHTML = sortedLocations.map(location => {
      // Determine if we should show preview content
      const showPreview = shouldShowPreview(location);

      // Select content to display
      const displayDescription = showPreview && location.previewDescription ? location.previewDescription : location.description;
      // Use previewImage if showing preview and it's set, otherwise use regular image
      let imageUrl;
      if (showPreview && location.previewImage) {
        imageUrl = location.previewImage;
      } else {
        imageUrl = location.image || DEFAULT_IMAGE;
      }
      // Apply default if still empty
      if (!imageUrl) imageUrl = DEFAULT_IMAGE;

      return `
        <div class="location-card" data-day="${location.day}">
          <img src="${imageUrl}" alt="Luukku ${location.day}" class="card-image">
          <div class="day-badge">${location.day}</div>
          <div class="date">${location.day}. joulukuuta 2025</div>
          <div class="description">${displayDescription}</div>
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
