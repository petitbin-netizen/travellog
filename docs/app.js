(function () {
  'use strict';

  var STORAGE_KEY = 'travellog_records_v1';
  var records = null;

  function loadFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      console.warn('저장 실패 (localStorage 사용 불가):', e);
      return false;
    }
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, opts) {
    var e = document.createElement(tag);
    opts = opts || {};
    if (opts.className) e.className = opts.className;
    if (opts.text !== undefined) e.textContent = opts.text;
    if (opts.html !== undefined) e.innerHTML = opts.html;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) { e.setAttribute(k, opts.attrs[k]); });
    }
    return e;
  }

  function findRecord(id) {
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) return records[i];
    }
    return null;
  }

  function isEmbedMapUrl(u) {
    if (!u) return false;
    var lu = u.toLowerCase();
    return lu.indexOf('/maps/embed') !== -1 || lu.indexOf('output=embed') !== -1;
  }

  function fmtRange(start, end) {
    if (!start) return '';
    return start === end ? start : (start + ' ~ ' + end);
  }

  function buildRouteUrl(places, cityHint) {
    var names = (places || []).map(function (p) { return p.name; }).filter(Boolean);
    if (names.length < 2) return null;
    var withHint = function (s) { return cityHint ? (s + ' ' + cityHint) : s; };
    var origin = encodeURIComponent(withHint(names[0]));
    var destination = encodeURIComponent(withHint(names[names.length - 1]));
    var waypoints = names.slice(1, -1).map(function (n) { return encodeURIComponent(withHint(n)); }).join('|');
    var url = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + destination;
    if (waypoints) url += '&waypoints=' + waypoints;
    return url;
  }

  function countPlaces(record) {
    var n = 0;
    (record.days || []).forEach(function (d) { n += (d.places || []).length; });
    return n;
  }

  function dateList(start, end) {
    var out = [];
    var cur = new Date(start + 'T00:00:00');
    var last = new Date(end + 'T00:00:00');
    while (cur <= last) {
      var y = cur.getFullYear();
      var m = String(cur.getMonth() + 1).padStart(2, '0');
      var d = String(cur.getDate()).padStart(2, '0');
      out.push(y + '-' + m + '-' + d);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  /* ---------- 목록 화면 ---------- */
  function renderList() {
    var root = qs('#app-root');
    root.innerHTML = '';
    if (!records.length) {
      root.appendChild(el('p', { className: 'day-empty', text: '아직 기록이 없습니다. "+ Add Travel" 로 첫 여행을 남겨보세요.' }));
      return;
    }
    records.forEach(function (record) {
      var card = el('a', {
        className: 'card',
        attrs: { href: 'record.html?id=' + encodeURIComponent(record.id), 'data-record-card': '' }
      });
      var cover = el('div', { className: 'card-cover' });
      if (record.cover_image) {
        cover.appendChild(el('img', { attrs: { src: record.cover_image, alt: record.title || '여행 커버 이미지' } }));
      } else {
        cover.appendChild(el('span', { text: '사진 없음' }));
      }
      var body = el('div', { className: 'card-body' });
      body.appendChild(el('h3', { className: 'card-title', text: record.title || (record.countries || []).join(', ') }));
      body.appendChild(el('p', {
        className: 'card-meta',
        text: fmtRange(record.start_date, record.end_date) + ' · 장소 ' + countPlaces(record) + '곳'
      }));
      var badges = el('div', { className: 'badge-row' });
      (record.countries || []).concat(record.cities || []).forEach(function (t) {
        badges.appendChild(el('span', { className: 'badge', text: t }));
      });
      body.appendChild(badges);
      card.appendChild(cover);
      card.appendChild(body);
      root.appendChild(card);
    });
  }

  /* ---------- 상세 화면 ---------- */
  function renderDetail() {
    var root = qs('#app-root');
    root.innerHTML = '';
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var record = findRecord(id);
    if (!record) {
      root.appendChild(el('p', { text: '기록을 찾을 수 없습니다.' }));
      return;
    }

    var header = el('div', { className: 'detail-header' });
    header.appendChild(el('h2', { className: 'detail-title', text: record.title || (record.countries || []).join(', ') }));
    header.appendChild(el('p', {
      className: 'detail-meta',
      text: fmtRange(record.start_date, record.end_date) + ' · ' + (record.countries || []).join(', ') + ' · ' + (record.cities || []).join(', ')
    }));
    root.appendChild(header);

    var cityHint = (record.cities || []).join(' ');

    (record.days || []).forEach(function (day) {
      var dayCard = el('div', { className: 'day-card', attrs: { 'data-day-item': '' } });
      var dayHead = el('div', { className: 'day-head' });
      dayHead.appendChild(el('span', { className: 'day-date', text: day.date }));

      var places = day.places || [];
      var routeUrl = buildRouteUrl(places, cityHint);
      if (routeUrl) {
        dayHead.appendChild(el('a', {
          className: 'day-route-btn',
          text: '이 날짜 동선 보기 ↗',
          attrs: { href: routeUrl, target: '_blank', rel: 'noopener', 'data-day-route': '' }
        }));
      }
      dayCard.appendChild(dayHead);

      if (day.map_url) {
        if (isEmbedMapUrl(day.map_url)) {
          dayCard.appendChild(el('iframe', {
            className: 'day-map-embed',
            attrs: { src: day.map_url, 'data-map-embed': '', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade' }
          }));
        } else {
          dayCard.appendChild(el('a', {
            className: 'day-map-link',
            text: '구글맵에서 보기 →',
            attrs: { href: day.map_url, target: '_blank', rel: 'noopener', 'data-map-link': '' }
          }));
        }
      }

      if (places.length) {
        var ul = el('ul', { className: 'place-list' });
        places.forEach(function (p) {
          var li = el('li', { className: 'place-item', attrs: { 'data-place-item': '' } });
          li.appendChild(el('div', { className: 'place-name', text: p.name }));
          if (p.memo) li.appendChild(el('div', { className: 'place-memo', text: p.memo }));
          if (p.map_url) {
            li.appendChild(el('a', {
              className: 'place-map-link',
              text: '지도에서 보기 →',
              attrs: { href: p.map_url, target: '_blank', rel: 'noopener', 'data-place-map-link': '' }
            }));
          }
          ul.appendChild(li);
        });
        dayCard.appendChild(ul);
      } else if (!day.map_url) {
        dayCard.appendChild(el('p', { className: 'day-empty', text: '이 날은 이동 기록이 없습니다.' }));
      }

      root.appendChild(dayCard);
    });

    var commentsSection = el('div', { className: 'comments-section' });
    commentsSection.appendChild(el('h3', { className: 'comments-title', text: '코멘트' }));
    (record.comments || []).forEach(function (c) {
      var item = el('div', { className: 'comment-item', attrs: { 'data-comment-item': '' } });
      item.appendChild(el('div', { text: c.text }));
      if (c.date) item.appendChild(el('div', { className: 'comment-date', text: c.date }));
      commentsSection.appendChild(item);
    });

    var form = el('div', { className: 'comment-form' });
    var input = el('input', { attrs: { type: 'text', placeholder: '짧은 코멘트를 남겨보세요 (5자 이상)' } });
    var addBtn = el('button', { className: 'btn-accent', text: '추가' });
    addBtn.addEventListener('click', function () {
      var text = input.value.trim();
      if (text.length < 5) { alert('코멘트는 5자 이상 적어주세요.'); return; }
      record.comments = record.comments || [];
      record.comments.push({ text: text, date: new Date().toISOString().slice(0, 10) });
      input.value = '';
      saveToStorage();
      renderDetail();
    });
    form.appendChild(input);
    form.appendChild(addBtn);
    commentsSection.appendChild(form);
    root.appendChild(commentsSection);

    var editBtn = qs('#btn-edit-travel');
    if (editBtn) editBtn.onclick = function () { openModal(record); };
  }

  /* ---------- Add Travel 모달 ---------- */
  var modalOverlay = null;
  var editingRecord = null;
  var currentDaysData = {};

  function buildModalOnce() {
    if (modalOverlay) return;
    modalOverlay = el('div', { className: 'modal-overlay hidden' });
    modalOverlay.innerHTML =
      '<div class="modal">' +
      '  <h2 id="modal-title">Add Travel</h2>' +
      '  <div class="field"><label>국가 (쉼표로 구분, 1개 이상 필수)</label><input id="f-countries" placeholder="예: 이탈리아, 스위스"></div>' +
      '  <div class="field"><label>도시 (쉼표로 구분, 1개 이상 필수)</label><input id="f-cities" placeholder="예: 로마, 밀라노"></div>' +
      '  <div class="field"><label>여행 제목 (선택)</label><input id="f-title"></div>' +
      '  <div class="field">' +
      '    <label>대표 이미지 (썸네일, 선택)</label>' +
      '    <input id="f-cover-url" placeholder="이미지 URL을 붙여넣거나, 아래에서 파일을 선택하세요">' +
      '    <input id="f-cover-file" type="file" accept="image/*" style="margin-top:8px;">' +
      '    <img id="f-cover-preview" class="cover-preview hidden" alt="미리보기">' +
      '  </div>' +
      '  <div class="field"><label>시작일 (필수)</label><input id="f-start" type="date"></div>' +
      '  <div class="field"><label>종료일 (필수)</label><input id="f-end" type="date"></div>' +
      '  <div id="f-days"></div>' +
      '  <div class="modal-actions">' +
      '    <button class="btn-ghost" id="btn-modal-cancel">닫기</button>' +
      '    <button class="btn-ghost" id="btn-modal-export">파일로 백업(선택)</button>' +
      '    <button class="btn-accent" id="btn-modal-save">저장</button>' +
      '  </div>' +
      '  <div id="export-panel" class="hidden">' +
      '    <p class="export-note">이 브라우저에는 자동 저장됩니다. 다른 기기·브라우저에서도 보려면<br>' +
      '    아래 내용을 복사해 <code>output/data/records.js</code> 전체를 이 내용으로 바꿔주세요.</p>' +
      '    <textarea class="export-box" id="export-box" readonly></textarea>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modalOverlay);

    qs('#f-start', modalOverlay).addEventListener('change', syncDayInputs);
    qs('#f-end', modalOverlay).addEventListener('change', syncDayInputs);
    qs('#btn-modal-cancel', modalOverlay).addEventListener('click', closeModal);
    qs('#btn-modal-save', modalOverlay).addEventListener('click', saveModal);
    qs('#btn-modal-export', modalOverlay).addEventListener('click', showExportPanel);
    qs('#f-cover-url', modalOverlay).addEventListener('input', function () {
      updateCoverPreview(this.value.trim());
    });
    qs('#f-cover-file', modalOverlay).addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      shrinkImageToThumbnail(file, 640, function (dataUrl) {
        qs('#f-cover-url', modalOverlay).value = dataUrl;
        updateCoverPreview(dataUrl);
      });
    });
  }

  function shrinkImageToThumbnail(file, maxWidth, callback) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxWidth / img.width);
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = function () { callback(reader.result); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function updateCoverPreview(url) {
    var preview = qs('#f-cover-preview', modalOverlay);
    if (url) {
      preview.src = url;
      preview.classList.remove('hidden');
    } else {
      preview.src = '';
      preview.classList.add('hidden');
    }
  }

  var dayRowsMap = {};

  function syncDayInputs() {
    var start = qs('#f-start', modalOverlay).value;
    var end = qs('#f-end', modalOverlay).value;
    var container = qs('#f-days', modalOverlay);
    container.innerHTML = '';
    dayRowsMap = {};
    if (!start || !end || start > end) return;
    dateList(start, end).forEach(function (date) {
      var existing = currentDaysData[date] || {};
      var row = el('div', { className: 'day-input-row' });
      dayRowsMap[date] = row;
      row.appendChild(el('label', { text: date }));

      var mapRow = el('div', { className: 'map-input-row' });
      var mapInput = el('input', { attrs: { placeholder: '이 날 전체 지도 URL (선택, 예: 숙소 위치)', 'data-day-map': '' } });
      mapInput.value = existing.map_url || '';
      var openMapsBtn = el('button', {
        className: 'btn-ghost btn-open-maps', text: '구글맵에서 찾기 ↗',
        attrs: { type: 'button' }
      });
      openMapsBtn.addEventListener('click', function () { openGoogleMapsPicker(null); });
      mapRow.appendChild(mapInput);
      mapRow.appendChild(openMapsBtn);
      row.appendChild(mapRow);
      row.appendChild(el('p', {
        className: 'map-hint',
        text: '장소별 지도 URL은 아래 각 장소 칸에 따로 넣으세요. 장소를 2개 이상 넣으면 상세 화면에서 "동선 보기"로 이어진 경로를 볼 수 있습니다.'
      }));

      var placesEditor = el('div', { className: 'places-editor' });
      (existing.places || []).forEach(function (p) {
        placesEditor.appendChild(buildPlaceRow(p.name, p.map_url, p.memo));
      });
      row.appendChild(placesEditor);

      var addPlaceBtn = el('button', {
        className: 'btn-ghost btn-add-place', text: '+ 장소 추가',
        attrs: { type: 'button' }
      });
      addPlaceBtn.addEventListener('click', function () {
        placesEditor.appendChild(buildPlaceRow('', '', ''));
      });
      row.appendChild(addPlaceBtn);

      container.appendChild(row);
    });
  }

  function buildPlaceRow(name, mapUrl, memo) {
    var pr = el('div', { className: 'place-input-row' });

    var line1 = el('div', { className: 'place-row-line1' });
    var nameInput = el('input', { attrs: { placeholder: '장소 이름', 'data-place-name': '' } });
    nameInput.value = name || '';
    var removeBtn = el('button', {
      className: 'btn-remove-place', text: '✕',
      attrs: { type: 'button', 'aria-label': '이 장소 삭제' }
    });
    removeBtn.addEventListener('click', function () { pr.remove(); });
    line1.appendChild(nameInput);
    line1.appendChild(removeBtn);

    var line2 = el('div', { className: 'place-row-line2' });
    var mapInput = el('input', { attrs: { placeholder: '이 장소 구글맵 URL (선택)', 'data-place-map': '' } });
    mapInput.value = mapUrl || '';
    var findBtn = el('button', {
      className: 'btn-ghost btn-open-maps', text: '구글맵에서 찾기 ↗',
      attrs: { type: 'button' }
    });
    findBtn.addEventListener('click', function () { openGoogleMapsPicker(nameInput); });
    line2.appendChild(mapInput);
    line2.appendChild(findBtn);

    var memoInput = el('input', {
      className: 'place-memo-input',
      attrs: { placeholder: '이 장소 코멘트 (선택)', 'data-place-memo': '' }
    });
    memoInput.value = memo || '';

    pr.appendChild(line1);
    pr.appendChild(line2);
    pr.appendChild(memoInput);
    return pr;
  }

  function openGoogleMapsPicker(nameEl) {
    var placeName = (nameEl && nameEl.value.trim()) || '';
    var cityCountry = splitList(qs('#f-cities', modalOverlay).value).concat(
      splitList(qs('#f-countries', modalOverlay).value)
    ).join(' ');
    var query = [placeName, cityCountry].filter(Boolean).join(' ');
    var url = 'https://www.google.com/maps' + (query ? ('/search/' + encodeURIComponent(query)) : '');
    window.open(url, '_blank', 'noopener');
  }

  function openModal(record) {
    buildModalOnce();
    editingRecord = record || null;
    currentDaysData = {};
    if (record) {
      (record.days || []).forEach(function (d) { currentDaysData[d.date] = d; });
      qs('#modal-title', modalOverlay).textContent = '여행 수정';
      qs('#f-countries', modalOverlay).value = (record.countries || []).join(', ');
      qs('#f-cities', modalOverlay).value = (record.cities || []).join(', ');
      qs('#f-title', modalOverlay).value = record.title || '';
      qs('#f-start', modalOverlay).value = record.start_date || '';
      qs('#f-end', modalOverlay).value = record.end_date || '';
      qs('#f-cover-url', modalOverlay).value = record.cover_image || '';
      updateCoverPreview(record.cover_image || '');
    } else {
      qs('#modal-title', modalOverlay).textContent = 'Add Travel';
      qs('#f-countries', modalOverlay).value = '';
      qs('#f-cities', modalOverlay).value = '';
      qs('#f-title', modalOverlay).value = '';
      qs('#f-start', modalOverlay).value = '';
      qs('#f-end', modalOverlay).value = '';
      qs('#f-cover-url', modalOverlay).value = '';
      updateCoverPreview('');
    }
    qs('#f-cover-file', modalOverlay).value = '';
    syncDayInputs();
    qs('#export-panel', modalOverlay).classList.add('hidden');
    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
  }

  function splitList(v) {
    return v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function saveModal() {
    var countries = splitList(qs('#f-countries', modalOverlay).value);
    var cities = splitList(qs('#f-cities', modalOverlay).value);
    var start = qs('#f-start', modalOverlay).value;
    var end = qs('#f-end', modalOverlay).value;
    if (!countries.length || !cities.length || !start || !end) {
      alert('국가·도시·시작일·종료일은 필수입니다.');
      return;
    }

    var days = dateList(start, end).map(function (date) {
      var row = dayRowsMap[date];
      var mapEl = row ? row.querySelector('[data-day-map]') : null;
      var mapUrl = mapEl ? mapEl.value.trim() : '';
      var day = { date: date };
      if (mapUrl) day.map_url = mapUrl;

      var places = [];
      var placeRows = row ? row.querySelectorAll('.place-input-row') : [];
      placeRows.forEach(function (pr) {
        var nameEl = pr.querySelector('[data-place-name]');
        var placeMapEl = pr.querySelector('[data-place-map]');
        var memoEl = pr.querySelector('[data-place-memo]');
        var name = nameEl ? nameEl.value.trim() : '';
        if (!name) return;
        var place = { name: name, order: places.length + 1 };
        var placeMapUrl = placeMapEl ? placeMapEl.value.trim() : '';
        if (placeMapUrl) place.map_url = placeMapUrl;
        var memo = memoEl ? memoEl.value.trim() : '';
        if (memo) place.memo = memo;
        places.push(place);
      });
      if (places.length) day.places = places;
      return day;
    });

    var record = editingRecord || { id: 'trip-' + Date.now(), comments: [] };
    record.title = qs('#f-title', modalOverlay).value.trim();
    record.countries = countries;
    record.cities = cities;
    record.cover_image = qs('#f-cover-url', modalOverlay).value.trim();
    record.start_date = start;
    record.end_date = end;
    record.days = days;
    record.comments = record.comments || [];

    if (!editingRecord) records.push(record);
    editingRecord = record;

    saveToStorage();
    renderCurrentPage();
    closeModal();
  }

  function showExportPanel() {
    qs('#export-panel', modalOverlay).classList.remove('hidden');
    qs('#export-box', modalOverlay).value = 'const RECORDS = ' + JSON.stringify(records, null, 2) + ';\n';
  }

  /* ---------- 초기화 ---------- */
  function renderCurrentPage() {
    var page = document.body.getAttribute('data-page');
    if (page === 'list') renderList();
    else if (page === 'detail') renderDetail();
  }

  function init() {
    var addBtn = qs('#btn-add-travel');
    if (addBtn) addBtn.addEventListener('click', function () { openModal(null); });

    var reloadBtn = qs('#btn-reload-file');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', function () {
        if (confirm('이 브라우저에 저장된 수정 내용을 지우고 records.js 파일 내용으로 되돌릴까요?')) {
          try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
          window.location.reload();
        }
      });
    }

    var stored = loadFromStorage();
    if (stored) {
      records = stored;
      renderCurrentPage();
      return;
    }

    records = (typeof RECORDS !== 'undefined') ? RECORDS.slice() : null;
    if (records === null) {
      records = [];
      fetch('data/records.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { records = data; saveToStorage(); renderCurrentPage(); })
        .catch(function () { renderCurrentPage(); });
      return;
    }
    renderCurrentPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
