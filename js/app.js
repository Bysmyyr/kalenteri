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
    {
      day: 1,
      image: "1.jpg",
      description: "Kiitävi aika, vierähtävät vuodet.\n" +
        "\n" +
        "\n" +
        "Tänä vuonna Törölän tonttu pyöritti ovenpieleen somisteeksi vanhan kärrynpyörän. \n" +
        "\n" +
        "Se olkoot muistutuksena elämän kierrosta ja ajan kerroksellisuudesta. Taas on vuosi vierähtänyt tuoden elämään muutoksen värejä ja sävyjä. Aika vie meitä eteenpäin, mutta toistuvissa perinteissä on jotakin lohdullista ja tuttua – jotakin, joka asettaa maailman pyörityksen mittasuhteisiinsa.\n" +
        "\n" +
        "On tullut hetki pukea Littoisten kodit ja pihapiirit joulutunnelmaan. \n" +
        "\n" +
        "Nyt on aika lähteä jouluisille kävelyille naapurustoon joulukalenterin innoittamana – ja huokaista hetki.",
      lat: 60.45084722008606,
      lng: 22.402141327176924
    },
    {
      day: 2,
      description: "Tule kokemaan Mutteritalon satumainen karkkipolku. Saatat nähdä joulupukin kapuamassa katolle ! 🎅🏻",
      image: "2.jpg",
      lat: 60.449654628377544,
      lng: 22.40318196186968
    },
    {
      day: 3,
      description: "Miksi joulupukki vaihtoi kännykkää? 🎅 Tule ottamaan siitä selvää ja anna joulumielen kasvaa, kun tekoälyn luomat vitsit piristävät päivääsi!\n" +
        "Astu hetkeksi tonttujen maailmaan, naura pukin kommelluksille ja anna joulutaian tarttua mukaasi. Luvassa kevyttä huumoria ja hyvää mieltä kaikenikäisille! ⛄\n" +
        "\n" +
        "Luukku on auki jouluun asti. Se löytyy talomme päädyssä olevan istutuslaatikon puolivälistä, jouluvalojen kohdalta. Tule siis rohkeasti pihalle",
      image: "3.png",
      lat: 60.4515264396043,
      lng: 22.41012383216059,
    },
    {
      day: 4,
      image: "4.png",
      lat: 60.453498039148194,
      lng: 22.418302986404758,
      description: "Hei pieni seikkailija/seikkailijat!\n" +
        "Tontut Nelly, Tilda ja Elmer kutsuvat sinut mukaan ihmeelliseen satuseikkailuun kotinsa portinpieleen, osoitteeseen Kalliorinne 4. He ovat valmistelleet salaisen tonttujen satuseikkailun. Sen läpi pääsee seuraamalla tarinaa ja tekemällä kuvitetun sadun tehtävät. Satuseikkailusta selvittyä saa korista napata pienen palkinnon mukaan kotimatkalle. "
    },
    {
      day: 5,
      lat: 60.44967679157192,
      lng: 22.404780752476576,
      image: "5.png",
      description: "Kuka maalasi taivaan?",
    },
    {
      day: 6,
      description: "Tervetuloa 6.12 kello 10 Ison Punasen vanhan pöytäryhmän luokse Itsenäisyyspäivän laulu-ja soittohetkeen 🎺\n\n Nallet Rauha ja Ylermi-Toivo istuvat penkillä rinnakkain ja lähettävät joulurauhaa kaikille. \n Usko, Toivo, Rakkaus - näissä Joulun ihme, salaisuus",
      previewDescription: "Ison Punasen väki toivottaa Hyvää Itsenäisyyspäivää soiton ja laulun voimin <b>  kello 10 </b> vanhan pöytäryhmän luona. Lämpimästi tervetuloa.",
      image: "6.jpg",
      lat: 60.45072532835268,
      lng: 22.40304151505156
    },
    {
      day: 7,
      description: "Kutsu joulun tunnelmaan 🎄\nTervetuloa viettämään jouluista glögi- ja piparihetkeä Verkatehtaan sisäpihalle lasten leikkipaikan viereen <b>klo 16 - 17</b>! Luvassa on leppoisaa yhdessäoloa, pientä purtavaa ja joulun odotuksen tunnelmaa.\nKun olemme nauttineet glögistä ja pipareista, voimme yhdessä siirtyä lasten joulukirkkoon laulamaan.",
      previewDescription: "<b> Klo 16:00 - 17:00 </b> Iloista yhdessäoloa, glögiä ja pipareita. Lapset pääsevät leikkimään yhdessä. Sen jälkeen voidaan lähteä yhdessä lasten kanssa laulamaan joululauluja kirkkoon.",
      image: "7.png",
      lat: 60.45002889356319,
      lng: 22.403744736835353
    },
    {
      day: 8,
      description: "Jollei jouluna ole lunta, voiko joulupukki tullakaan?\nYksi vaihtoehto on tietenkin polkupyörä. Pukin teknikkoapulainen Hiiri on luvannut laittaa Pukin pyörän ajokuntoon.\nVaikuttaa kuitenkin siltä, että pyörä saattaa vaatia muutakin kuin lisää ilmaa renkaisiin… ehtiiköhän Hiiri kunnostaa pyörän ajoissa?",
      image: "8.jpg",
      lat: 60.45273011497546,
      lng: 22.407787843436687
    },
    {
      day: 9,
      description: "Nappulametsän kuusen takaa paljastuu lasten eläinystävien riemukkaita talvipuuhia.",
      image: "9.jpeg",
      lat: 60.45102288975213,
      lng: 22.414926517333928 ,
    },
    {
      day: 10,
      description: "Joulukalenteriluukku numero 10 avautuu. Nallevaari sukulaisineen ja ystävineen on saapunut tänäkin vuonna viettämään perinteistä joulujuhlaansa Verkatehtaan leikkimökkiin. Tulehan sinäkin vierailulle!\n\n\nUudet Nallemökin rakentajat lähettävät rakkaita jouluterveisiä idean alkuperäiskehittäjälle Sarille 🧸🎄 ❤️",
      image: "10.jpg",
      lat: 60.44994278125212,
      lng:  22.403868873699338,
    },
    {
      day: 11,
      description: "Tule laulamaan kanssamme kauneimpia joululauluja alkaen <b>klo 18:00</b>",
      previewDescription: "Tule laulamaan kanssamme kauneimpia joululauluja alkaen <b>klo 18:00</b>",
      image: "11.jpg",
      lat: 60.45134060615078,
      lng: 22.403596153407985
    },
    {
      day: 12,
      image: "12.jpg",
      lat: 60.454612186610234,
      lng: 22.411872577014808
    },
    {
      day: 13,
      image: "13.jpg",
      lat: 60.44855973606509,
      lng: 22.40439627504237,
      description: "Hei mahtavat Litsalaiset  Tänään on Littoisten joulukatutapahtuma <b>klo 17-19</b>!! Viime vuosien tapaan kaikki Litsalaiset (entiset, nykyiset ja tulevat) ovat erittäin tervetulleita nauttimaan yhteisestä hetkestä!! 🙂 Tuo mukanasi oma lyhty, osta paikan päältä jouluisia herkkuja ja tutustu ihanan kylämme asukkaisiin. Littoisten oma MLL tarjoaa karkkeja lapsille. Vietetään jouluinen hetki yhdessä!",
      previewDescription: "Littoisten joulukatutapahtuma <b>klo 17-19</b>. Tuo mukanasi oma lyhty, osta paikan päältä jouluisia herkkuja ja tutustu ihanan kylämme asukkaisiin."
    },
    {
      day: 14,
      image: "14.jpg",
      lat: 60.45083593671429,
      lng: 22.408242906747066,
      description: "Pitsinen lumisade\n\nHiljaa, kuin jouluyö, laskeutuu pitsinen lumisade. Vanhojen liinojen herkät kuviot kantavat mukanaan tarinoita kodeista, käsistä ja jouluista menneiltä vuosilta.\n\nValon ja varjon leikissä pitsit heräävät eloon leijuviksi lumihiutaleiksi, pois pöydiltä ja varastojen nurkista pölyttymästä. Pitsinen lumisade on kunnianosoitus käsityöperinteelle ja talven kauneudelle. Ja luo toiveen valkoisesta joulusta.\n\nLuukku 14 kutsuu pysähtymään, hengittämään hetken joulun hiljaisuutta ja aistimaan kiireettömyyden.\n\nJokainen liina on oma yksilönsä kuin lumihiutale, ainutlaatuinen ja hetken valoissa välkehtivä. Löydätkö kaksi samanlaista?"
    },
    {
      day: 15,
      lat: 60.45206427815843,
      lng: 22.41174481610432,
      description: "Tervetuloa Littoisten koulun pihalle klo 17.30–18.30!\nTule viettämään mukava pieni hetki arki-illan keskellä. Tarjolla pihapelejä ja pipareita kaikenikäisille. Tavataan koulun kentällä.\n\nKäy samalla kurkkaamassa Instagramissa @piparkakkuprojekti.\nSieltä löytyy Nallelandian piparimaailma, pitkään jatkunut perinne eräässä osin littoislaistuneessa suvussa. Tämän vuoden piparkakkuteos rakentuu 19.–21.12. viikonloppuna. Luvassa on taas uudenlainen luomus ja kekseliäitä yksityiskohtia.\n\nLämpimästi tervetuloa mukaan joulukalenterin luukulle!",
      previewDescription: "Pihapelejä ja pipareita kaikenikäisille <b> klo 17:30-18:30</b>.",
      image: "15.jpg"
    },
    {
      day: 16,
      description: "Tontuilla on vuoden kiireisin aika menossa ja täysi touhu päällä -ainakin meidän tehtaan nurkilla pyörivillä.\nKuinka monta tonttua löydät 🧑🏻‍🎄",
      image: "16.jpg",
      lat: 60.449945894451176,
      lng:  22.402620899424516
    },
    {
      day: 17,
      description: "Tule katsomaan tonttujen touhua. Tähtituvan tontut Stara ja Tuikku pääsevät tänä vuonna pukin mukaan lahjoja jakamaan. He harjoittelevat pakettien lastaamista jo etukäteen, että se sitten aattona onnistuu ilman ongelmia. \n" +
        "Ovat lastanneet Petriina poron selkäänkin jo paketteja. Mahtaako paketit pysyä Petriinan selässä kun hän johtaa porovaljakkoa, joka vetää pukin rekeä.",
      image: "17.jpg",
      lat: 60.45462009619115,
      lng: 22.41695969378407
    },
    {
      day: 18,
      description: "Metsät, laaksot lumiset, kilisevät kulkuset ja tähtitaivas kirkas tuo taas joulumielen meille luo. ✨❄️\n\nLittoisten metsän asukkaat toivottavat rauhallista joulua!",
      image: "18.jpg",
      lat: 60.446882482634436,
      lng: 22.409809986107653
    },
    {
      day: 19,
      description: "Viime vuonna ikkunaan\nJäi pukki kiinni nutustaan\n\nTänä vuonna tuumi hän\n\"Jos katon kautta yritän\".\nMut huono tuuri oli taas\nJäi parta kiinni saumaan nääs.",
      image: "19.jpg",
      lat: 60.45093741391784,
      lng: 22.404264698928536
    },
    {
      day: 20,
      description: "Tule A-rapun eteen <b>klo 17.00</b>, silloin tapahtuu jotain yllättävää.",
      previewDescription: "Tule A-rapun eteen <b>klo 17.00</b>, silloin tapahtuu jotain yllättävää.",
      image: "20.jpg",
      lat: 60.44984102697147,
      lng: 22.403989658559337
    },
    {
      day: 21,
      description: "Tavataan illalla kello kuusi kuusen juurella 🎄. Toivotetaan porukalla Verkatehtaan portin uudelle kuuselle hyvää kasvua ja pitkää ikää! Seuraa tarjoilee niin moni naapuri ja kyläläinen, kuin paikalle pääsee. Lämmintä glögiä meille tarjoaa Verkarannan Huolto Oy.",
      previewDescription: "Tavataan Verkatehtaan portin kuusen juurella <b>klo 18</b>. Tarjolla lämmintä glögiä!",
      image: "21.jpg",
      lat: 60.44986944549243,
      lng: 22.403707458845187,
    },
    {
      day: 22,
      image: "",
      lat: 60.45846250668906,
      lng: 22.419487232023357
    },
    {
      day: 23,
      description: "Nallella on jouluvalmistelut kesken, tule katsomaan osoitteeseen Puuvillakuja 3 B saako nalle koristeltua joulupuun ennen aattoa. 🧸",
      image: "23.jpg",
      lat: 60.447430511152305,
      lng: 22.40694698637342
    },
    {
      day: 24,
      image: "",
      lat: 60.45134060615078,
      lng: 22.403596153407985
    }
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

  // Create yellow star icon for preview days
  const previewIcon = L.divIcon({
    html: '<div style="font-size: 28px;">⭐</div>',
    className: 'preview-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

  const defaultIcon = new L.Icon.Default();

  function initMap() {
    // Create map centered on Littoisten Verkatehdas with autoPan options
    // Coordinates: N=6710372.038, E=247233.694 (ETRS-TM35FIN)
    map = L.map('map', {
      autoPanOnFocus: true,
      autoPan: true
    }).setView([60.4502, 22.4112], 15);

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
    // In preview_all mode, never show preview (show full content)
    if (isPreviewAllMode()) return false;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    // Before December or in December before the day: show preview if preview description exists
    if (currentMonth < 11 || (currentMonth === 11 && currentDay < location.day)) {
      return location.previewDescription;
    }
    return false;
  }

  // Helper function to get full image path
  function getImagePath(imageFilename) {
    if (!imageFilename) return DEFAULT_IMAGE;
    // If already has img/ prefix or is a full path, return as is
    if (imageFilename.startsWith('img/') || imageFilename.startsWith('/')) {
      return imageFilename;
    }
    // Otherwise, prepend img/
    return `img/${imageFilename}`;
  }

  // Check if dev mode is enabled via URL parameter
  function isDevMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dev_mode') === 'on';
  }

  // Check if preview_all mode is enabled via URL parameter
  // This mode shows all locations as they would appear on December 24th
  function isPreviewAllMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('preview_all') === 'on';
  }

  // Check if a day is publicly accessible
  function isDayAccessible(day) {
    const location = locations.find(loc => loc.day === day);
    if (!location) return false;

    // In preview_all mode, all days are accessible
    if (isPreviewAllMode()) return true;

    // In dev mode, all days are accessible
    if (isDevMode()) return true;

    // Check if day is publicly available
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();

    const dayHasArrived = currentMonth === 11 && day <= currentDay;
    const hasPreview = shouldShowPreview(location);

    return dayHasArrived || hasPreview;
  }

  function updateMapMarkers(selectedDay = null) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Get current date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed, so December is 11, November is 10

    // Add new markers for locations
    locations.forEach(location => {
      const dayHasArrived = currentMonth === 11 && location.day <= currentDay;
      const hasPreview = shouldShowPreview(location);

      // In preview_all mode, show all locations
      if (isPreviewAllMode()) {
        // Show all locations in preview_all mode
      } else {
        // Show if:
        // - In December and day has arrived, OR
        // - Has preview content (shown in any month before the day), OR
        // - This is the selected day (always show selected marker in dev mode)
        const isSelected = selectedDay !== null && location.day === selectedDay && isDevMode();

        if (!dayHasArrived && !hasPreview && !isSelected) return;
      }

      // Choose icon based on whether day has arrived or is preview
      let markerIcon = defaultIcon;
      if (hasPreview && !dayHasArrived) {
        markerIcon = previewIcon; // Yellow star for preview days
      }

      const marker = L.marker([location.lat, location.lng], { icon: markerIcon })
        .addTo(map);

      // Store location data with marker
      marker.locationDay = location.day;
      marker.isPreview = hasPreview && !dayHasArrived;

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

    // Check if day is accessible (unless in dev mode)
    if (!isDayAccessible(day)) {
      console.log(`Day ${day} is not yet accessible`);
      return;
    }

    // Reset previous active marker to appropriate icon (preview or default)
    if (activeMarker) {
      if (activeMarker.isPreview) {
        activeMarker.setIcon(previewIcon);
      } else {
        activeMarker.setIcon(defaultIcon);
      }
    }

    // Update markers to ensure the selected day is visible
    updateMapMarkers(day);

    // Find and set new active marker
    markers.forEach(marker => {
      if (marker.locationDay === day) {
        marker.setIcon(christmasTreeIcon);
        activeMarker = marker;
      }
    });

    // Zoom to location
    map.setView([location.lat, location.lng], 18);

    // Scroll to map section (position at top of viewport) after a brief delay to let map pan
    setTimeout(() => {
      const mapSection = document.querySelector('.map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

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
    const displayDescription = showPreview && location.previewDescription ? location.previewDescription : (location.description || "Tule ja ylläty!");
    // Convert \n to <br> for HTML display
    const displayDescriptionHtml = displayDescription.replace(/\n/g, '<br>');
    // Use default image if showing preview, otherwise use regular image
    let imageUrl;
    if (showPreview) {
      imageUrl = DEFAULT_IMAGE;
    } else {
      imageUrl = getImagePath(location.image);
    }

    // Create a copy of the card
    const highlightedCard = document.createElement('div');
    highlightedCard.className = 'location-card highlighted-card';
    highlightedCard.dataset.day = location.day;
    highlightedCard.innerHTML = `
      <img src="${imageUrl}" alt="Luukku ${location.day}" class="card-image">
      <div class="card-content">
        <div class="day-badge">${location.day}</div>
        <div class="date">${location.day}. joulukuuta 2025</div>
        <div class="description">${displayDescriptionHtml}</div>
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
        // In preview_all mode, show all locations
        if (isPreviewAllMode()) return true;

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
      const displayDescription = showPreview && location.previewDescription ? location.previewDescription : (location.description || "Tule ja ylläty!");
      // Convert \n to <br> for HTML display
      const displayDescriptionHtml = displayDescription.replace(/\n/g, '<br>');
      // Use default image if showing preview, otherwise use regular image
      let imageUrl;
      if (showPreview) {
        imageUrl = DEFAULT_IMAGE;
      } else {
        imageUrl = getImagePath(location.image);
      }

      return `
        <div class="location-card" data-day="${location.day}">
          <img src="${imageUrl}" alt="Luukku ${location.day}" class="card-image">
          <div class="day-badge">${location.day}</div>
          <div class="date">${location.day}. joulukuuta 2025</div>
          <div class="description">${displayDescriptionHtml}</div>
        </div>
      `;
    }).join('');

    // Add click handlers for cards
    document.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', () => {
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
        // Only allow access if day is publicly accessible or dev mode is on
        if (isDayAccessible(day)) {
          setTimeout(() => {
            setActiveLocation(day, false); // Don't update URL since we're loading from it
          }, 500);
          return true;
        } else {
          // Clear invalid hash
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          return false;
        }
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
