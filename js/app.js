// Advent Calendar Map Application
(function() {
  'use strict';

  // Default sample locations (can be edited by user)
  // All locations in Littoinen, Finland area
  let locations = [
    {
      day: 1,
      name: "Winter Wonderland Park",
      description: "A magical park covered in snow, perfect for winter walks.",
      image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=600",
      lat: 60.4850,
      lng: 22.3800
    },
    {
      day: 2,
      name: "Christmas Market Square",
      description: "Traditional Christmas market with festive treats and gifts.",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600",
      lat: 60.4870,
      lng: 22.3820
    },
    {
      day: 3,
      name: "Cozy Coffee Shop",
      description: "Warm up with hot chocolate and gingerbread cookies.",
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600",
      lat: 60.4830,
      lng: 22.3850
    },
    {
      day: 4,
      name: "Ice Skating Rink",
      description: "Glide across the ice under twinkling lights.",
      image: "https://images.unsplash.com/photo-1551524164-687a55dd1126?w=600",
      lat: 60.4890,
      lng: 22.3780
    },
    {
      day: 5,
      name: "Historic Cathedral",
      description: "Beautiful architecture and peaceful Christmas atmosphere.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
      lat: 60.4810,
      lng: 22.3900
    },
    {
      day: 6,
      name: "Mountain Lodge",
      description: "Cozy retreat in the snowy mountains.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
      lat: 60.4860,
      lng: 22.3750
    },
    {
      day: 7,
      name: "Festive Bakery",
      description: "Fresh Christmas cookies and traditional pastries.",
      image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600",
      lat: 60.4820,
      lng: 22.3920
    },
    {
      day: 8,
      name: "Toy Workshop",
      description: "Where the magic of Christmas toys comes to life.",
      image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600",
      lat: 60.4900,
      lng: 22.3810
    },
    {
      day: 9,
      name: "Snowy Forest Trail",
      description: "Peaceful walk through winter forest paths.",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=600",
      lat: 60.4840,
      lng: 22.3700
    },
    {
      day: 10,
      name: "Christmas Light Street",
      description: "Spectacular holiday light displays.",
      image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600",
      lat: 60.4880,
      lng: 22.3950
    },
    {
      day: 11,
      name: "Gingerbread House",
      description: "A real-life gingerbread house you can visit.",
      image: "https://images.unsplash.com/photo-1576106920003-c1b1e48e8c0f?w=600",
      lat: 60.4790,
      lng: 22.3830
    },
    {
      day: 12,
      name: "Santa's Workshop",
      description: "Meet Santa and his elves at work.",
      image: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=600",
      lat: 60.4910,
      lng: 22.3760
    },
    {
      day: 13,
      name: "Winter Beach",
      description: "Unique winter seaside experience.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
      lat: 60.4800,
      lng: 22.3980
    },
    {
      day: 14,
      name: "Festive Theater",
      description: "Christmas shows and performances.",
      image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600",
      lat: 60.4920,
      lng: 22.3840
    },
    {
      day: 15,
      name: "Reindeer Farm",
      description: "Visit real reindeer and learn about them.",
      image: "https://images.unsplash.com/photo-1512850183-6d7990f42385?w=600",
      lat: 60.4770,
      lng: 22.3770
    },
    {
      day: 16,
      name: "Christmas Tree Farm",
      description: "Pick your perfect Christmas tree.",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600",
      lat: 60.4930,
      lng: 22.3790
    },
    {
      day: 17,
      name: "Candlelight Chapel",
      description: "Peaceful candlelit evening services.",
      image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=600",
      lat: 60.4780,
      lng: 22.3860
    },
    {
      day: 18,
      name: "Hot Cocoa Bar",
      description: "Artisan hot chocolate with festive toppings.",
      image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600",
      lat: 60.4940,
      lng: 22.3870
    },
    {
      day: 19,
      name: "Nutcracker Ballet",
      description: "Classic Christmas ballet performance.",
      image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600",
      lat: 60.4760,
      lng: 22.3910
    },
    {
      day: 20,
      name: "Winter Garden",
      description: "Botanical garden with winter displays.",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600",
      lat: 60.4950,
      lng: 22.3820
    },
    {
      day: 21,
      name: "Festive Concert Hall",
      description: "Christmas music and carol concerts.",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600",
      lat: 60.4750,
      lng: 22.3740
    },
    {
      day: 22,
      name: "Snowman Building Park",
      description: "Perfect spot for building snowmen.",
      image: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600",
      lat: 60.4960,
      lng: 22.3880
    },
    {
      day: 23,
      name: "Christmas Eve Church",
      description: "Traditional Christmas Eve service.",
      image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600",
      lat: 60.4740,
      lng: 22.3890
    },
    {
      day: 24,
      name: "Family Home",
      description: "Celebrate Christmas with loved ones.",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600",
      lat: 60.4850,
      lng: 22.3800
    }
  ];

  // Initialize map
  let map;
  let markers = [];
  function initMap() {
    // Create map centered on Littoinen, Finland with autoPan options
    map = L.map('map', {
      autoPanOnFocus: true,
      autoPan: true
    }).setView([60.4850, 22.3800], 12);

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

    // Add new markers
    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(createPopupContent(location), {
          autoPan: true,
          autoPanPaddingTopLeft: [20, 100],
          autoPanPaddingBottomRight: [20, 20],
          keepInView: true,
          maxWidth: 300
        });

      markers.push(marker);
    });
  }

  function createPopupContent(location) {
    return `
      <div class="popup-content">
        <h3>${location.name}</h3>
        <div class="date">December ${location.day}, 2024</div>
        <div class="description">${location.description}</div>
        ${location.image ? `<img src="${location.image}" alt="${location.name}">` : ''}
      </div>
    `;
  }

  function renderLocationsList() {
    const listContainer = document.getElementById('locationsList');
    
    // Sort locations by day
    const sortedLocations = [...locations].sort((a, b) => a.day - b.day);

    listContainer.innerHTML = sortedLocations.map(location => `
      <div class="location-card" data-day="${location.day}">
        <div class="day-badge">${location.day}</div>
        <h3>${location.name}</h3>
        <div class="date">December ${location.day}, 2024</div>
        <div class="description">${location.description}</div>
      </div>
    `).join('');

    // Add click handlers for cards
    document.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const day = parseInt(card.dataset.day);
        const location = locations.find(loc => loc.day === day);
        if (location) {
          // Scroll to map section first
          document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });
          
          // Set view with higher zoom and let Leaflet handle the popup positioning
          map.setView([location.lat, location.lng], 16);
          
          // Delay to ensure map has rendered and scrolled
          setTimeout(() => {
            // Find and open the popup for this location
            markers.forEach(marker => {
              const markerLatLng = marker.getLatLng();
              if (markerLatLng.lat === location.lat && markerLatLng.lng === location.lng) {
                marker.openPopup();
              }
            });
          }, 300);
        }
      });
    });
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderLocationsList();
    
    // Auto-zoom to current date location
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed, so December is 11
    
    // Only auto-zoom if we're in December and the day is between 1-24
    if (currentMonth === 11 && currentDay >= 1 && currentDay <= 24) {
      const currentLocation = locations.find(loc => loc.day === currentDay);
      if (currentLocation) {
        setTimeout(() => {
          map.setView([currentLocation.lat, currentLocation.lng], 16);
          
          // Open the popup for today's location
          setTimeout(() => {
            markers.forEach(marker => {
              const markerLatLng = marker.getLatLng();
              if (markerLatLng.lat === currentLocation.lat && markerLatLng.lng === currentLocation.lng) {
                marker.openPopup();
              }
            });
          }, 300);
        }, 500);
      }
    }
  });

})();
