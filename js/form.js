// Day submission form: modes, map picker, live preview.
(function () {
  'use strict';

  const { renderCard } = window.CalendarCard;
  const { sanitizeDescription } = window.FormLib;

  const DEFAULT_CENTER = [60.4502, 22.4112];

  const params = new URLSearchParams(window.location.search);
  const isEdit = params.get('edit') === '1';
  const editKey = params.get('key');
  const existing = isEdit
    ? window.LOCATIONS.find(loc => loc.day === parseInt(params.get('day'), 10))
    : null;

  const state = { lat: null, lng: null, imageDataUrl: null };
  let busy = false;

  const $ = id => document.getElementById(id);

  function showBlocked() {
    $('dayForm').hidden = true;
    $('blocked').hidden = false;
  }

  function setupMode() {
    if (!isEdit) return;
    $('formTitle').textContent = `🎄 Muokkaa luukkua ${existing.day} 🎄`;
    $('formIntro').textContent = 'Muokkaa tietoja, tarkista esikatselu ja lähetä lomake.';
    $('dayGroup').hidden = true;
    $('day').required = false;
    $('description').value = existing.description || '';
    $('previewDescription').value = existing.previewDescription || '';
  }

  function setLocationStatus() {
    $('locationStatus').textContent = state.lat === null
      ? 'Sijaintia ei ole vielä valittu.'
      : 'Sijainti valittu.';
  }

  function initMap() {
    const hasStart = existing && Number.isFinite(existing.lat) && Number.isFinite(existing.lng);
    const map = L.map('map').setView(hasStart ? [existing.lat, existing.lng] : DEFAULT_CENTER, hasStart ? 18 : 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    let marker = null;
    function place(latlng) {
      state.lat = latlng.lat;
      state.lng = latlng.lng;
      if (marker) {
        marker.setLatLng(latlng);
      } else {
        marker = L.marker(latlng, { draggable: true }).addTo(map);
        marker.on('dragend', () => place(marker.getLatLng()));
      }
      refresh();
    }
    map.on('click', e => place(e.latlng));
    if (hasStart) place(L.latLng(existing.lat, existing.lng));
  }

  function currentLocation() {
    return {
      day: isEdit ? existing.day : '?',
      description: sanitizeDescription($('description').value),
      previewDescription: sanitizeDescription($('previewDescription').value),
      image: existing ? existing.image : undefined
    };
  }

  function renderPreview() {
    const showPreview = document.querySelector('input[name="previewMode"]:checked').value === 'before';
    const location = currentLocation();
    if (showPreview && !location.previewDescription) {
      $('locationsList').innerHTML = '<p class="preview-note">Ennakkotekstiä ei ole, joten luukku ei näy kalenterissa ennen päivää.</p>';
      return;
    }
    $('locationsList').innerHTML = renderCard(location, {
      variant: 'list',
      showPreview,
      imageUrl: state.imageDataUrl || undefined
    });
  }

  function canSubmit() {
    return !busy && state.lat !== null && $('dayForm').checkValidity();
  }

  function refresh() {
    setLocationStatus();
    renderPreview();
    $('submitBtn').disabled = !canSubmit();
  }

  function init() {
    if (isEdit && (!existing || !editKey)) {
      showBlocked();
      return;
    }
    setupMode();
    initMap();
    $('dayForm').addEventListener('input', refresh);
    $('dayForm').addEventListener('change', refresh);
    refresh();
  }

  init();
})();
