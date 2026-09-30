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

  // 장소의 구글맵 링크에서 길찾기에 쓸 위치(좌표 또는 구글이 인식한 장소명)를 뽑는다.
  // 짧은 링크(maps.app.goo.gl 등)는 브라우저에서 풀 수 없어 null → 이름 검색으로 대체.
  function locationFromMapUrl(u) {
    if (!u) return null;
    var m;
    // 장소 핀의 정확한 좌표: !3d<lat>!4d<lng>
    m = u.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (m) return m[1] + ',' + m[2];
    // ?q= / ?query= / ?destination= 에 좌표 또는 장소명이 들어있는 경우
    m = u.match(/[?&](?:q|query|destination)=([^&]+)/);
    if (m) {
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { /* 무시 */ }
    }
    // /maps/place/<장소명>/ 경로
    m = u.match(/\/maps\/place\/([^/@?]+)/);
    if (m) {
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { /* 무시 */ }
    }
    // 지도 중심 좌표: @lat,lng
    m = u.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (m) return m[1] + ',' + m[2];
    return null;
  }

  function buildRouteUrl(places, cityHint) {
    var withHint = function (s) { return cityHint ? (s + ' ' + cityHint) : s; };
    var names = (places || []).filter(function (p) { return p.name || p.map_url; }).map(function (p) {
      return locationFromMapUrl(p.map_url) || (p.name ? withHint(p.name) : null);
    }).filter(Boolean);
    if (names.length < 2) return null;
    var origin = encodeURIComponent(names[0]);
    var destination = encodeURIComponent(names[names.length - 1]);
    var waypoints = names.slice(1, -1).map(function (n) { return encodeURIComponent(n); }).join('|');
    var url = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + destination;
    if (waypoints) url += '&waypoints=' + waypoints;
    return url;
  }

  /* ---------- 장소 카테고리 ---------- */
  function svgIcon(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var CATEGORIES = [
    { key: 'food', label: '음식점', fg: '#D9663A', bg: '#FDEEE6',
      svg: svgIcon('<path d="M5 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3"/><path d="M7 3v18"/><path d="M18 21V3c-2.4 1.3-3.5 3.8-3.5 6.5V14H18"/>') },
    { key: 'cafe', label: '카페', fg: '#A0714F', bg: '#F6ECE4',
      svg: svgIcon('<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5v2.5M12 2.5v2.5"/>') },
    { key: 'sight', label: '관광지', fg: '#3F9E86', bg: '#E5F5F0',
      svg: svgIcon('<path d="M3 9a2 2 0 0 1 2-2h2l1.5-2h7L17 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><circle cx="12" cy="13" r="3.5"/>') },
    { key: 'stay', label: '숙소', fg: '#5B7FD6', bg: '#E8EEFC',
      svg: svgIcon('<path d="M3 5v14"/><path d="M3 15h18v4"/><path d="M21 15v-2.5A2.5 2.5 0 0 0 18.5 10H11v5"/><circle cx="7" cy="11.5" r="1.6"/>') },
    { key: 'shop', label: '쇼핑', fg: '#C55C97', bg: '#FAE8F2',
      svg: svgIcon('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>') },
    { key: 'transport', label: '교통', fg: '#5E8F9E', bg: '#E6F1F4',
      svg: svgIcon('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/><path d="M8 17l-2 4M16 17l2 4"/>') },
    { key: 'activity', label: '액티비티', fg: '#D19A1F', bg: '#FBF3DC',
      svg: svgIcon('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>') },
    { key: 'etc', label: '기타', fg: '#7C7C8A', bg: '#EFEFF3',
      svg: svgIcon('<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>') }
  ];
  var CUSTOM_CATEGORY = { key: 'custom', label: '직접 입력', fg: '#9C8AD8', bg: '#F1EEFB',
    svg: svgIcon('<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.2"/>') };
  var NO_CATEGORY = { key: 'none', label: '', fg: '#9A9AA5', bg: '#F2F2F5',
    svg: svgIcon('<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>') };

  function categoryOf(place) {
    var key = place && place.category;
    if (key === 'custom') {
      var label = (place.category_label || '').trim();
      return label ? { key: 'custom', label: label, fg: CUSTOM_CATEGORY.fg, bg: CUSTOM_CATEGORY.bg, svg: CUSTOM_CATEGORY.svg } : NO_CATEGORY;
    }
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].key === key) return CATEGORIES[i];
    }
    return NO_CATEGORY;
  }

  function catStyle(cat) {
    return '--cat-fg:' + cat.fg + ';--cat-bg:' + cat.bg;
  }

  function buildCategorySummary(places) {
    var order = [];
    var counts = {};
    places.forEach(function (p) {
      var cat = categoryOf(p);
      if (cat.key === 'none') return;
      // 직접 입력은 라벨별로 따로 센다
      var id = cat.key === 'custom' ? 'custom:' + cat.label : cat.key;
      if (!counts[id]) { counts[id] = { cat: cat, n: 0 }; order.push(id); }
      counts[id].n++;
    });
    if (!order.length) return null;
    var row = el('div', { className: 'cat-summary' });
    order.forEach(function (id) {
      var c = counts[id];
      var item = el('span', { className: 'cat-chip cat-chip-count', attrs: { style: catStyle(c.cat) } });
      item.appendChild(el('span', { className: 'cat-chip-icon', html: c.cat.svg }));
      item.appendChild(document.createTextNode(c.cat.label + ' ' + c.n));
      row.appendChild(item);
    });
    return row;
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
        // 하루 요약: 카테고리별 아이콘 + 개수 (카테고리가 지정된 장소만)
        var summary = buildCategorySummary(places);
        if (summary) dayCard.appendChild(summary);

        var ul = el('ul', { className: 'place-list' });
        places.forEach(function (p) {
          var cat = categoryOf(p);
          var li = el('li', { className: 'place-item', attrs: { 'data-place-item': '', 'data-category': cat.key, style: catStyle(cat) } });
          li.appendChild(el('span', { className: 'cat-icon', html: cat.svg, attrs: { title: cat.label } }));
          var main = el('div', { className: 'place-main' });
          var titleRow = el('div', { className: 'place-title-row' });
          titleRow.appendChild(el('span', { className: 'place-name', text: p.name }));
          if (cat.label) titleRow.appendChild(el('span', { className: 'cat-chip', text: cat.label, attrs: { 'data-place-category': '' } }));
          main.appendChild(titleRow);
          if (p.memo) main.appendChild(el('div', { className: 'place-memo', text: p.memo }));
          if (p.map_url) {
            main.appendChild(el('a', {
              className: 'place-map-link',
              text: '지도에서 보기 →',
              attrs: { href: p.map_url, target: '_blank', rel: 'noopener', 'data-place-map-link': '' }
            }));
          }
          li.appendChild(main);
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
      '    화면 상단의 "내보내기"로 <code>records.js</code> 파일을 받아 다른 기기에서 "불러오기"로 올리세요.<br>' +
      '    (아래는 같은 내용을 텍스트로 본 것입니다. 실제 기록이 든 파일은 공개 저장소에 커밋하지 마세요.)</p>' +
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
        placesEditor.appendChild(buildPlaceRow(p));
      });
      row.appendChild(placesEditor);

      var addPlaceBtn = el('button', {
        className: 'btn-ghost btn-add-place', text: '+ 장소 추가',
        attrs: { type: 'button' }
      });
      addPlaceBtn.addEventListener('click', function () {
        placesEditor.appendChild(buildPlaceRow({}));
      });
      row.appendChild(addPlaceBtn);

      container.appendChild(row);
    });
  }

  // 카테고리 선택 칩: 프리셋 8종 + 직접 입력. 선택값은 행(pr)의 data-category에 둔다.
  // 같은 칩을 다시 누르면 선택 해제.
  function buildCategoryPicker(pr, place) {
    var wrap = el('div', { className: 'cat-picker' });
    var chips = el('div', { className: 'cat-picker-chips', attrs: { role: 'group', 'aria-label': '장소 카테고리' } });
    var customInput = el('input', {
      className: 'cat-custom-input',
      attrs: { placeholder: '카테고리 직접 입력 (예: 미술관, 온천)', maxlength: '20', 'data-place-category-label': '' }
    });
    customInput.value = place.category === 'custom' ? (place.category_label || '') : '';

    var buttons = {};
    function select(key, skipFocus) {
      pr.setAttribute('data-category', key || '');
      Object.keys(buttons).forEach(function (k) {
        var on = k === key;
        buttons[k].classList.toggle('active', on);
        buttons[k].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      customInput.classList.toggle('hidden', key !== 'custom');
      if (key === 'custom' && !skipFocus) customInput.focus();
    }

    CATEGORIES.concat([CUSTOM_CATEGORY]).forEach(function (cat) {
      var b = el('button', {
        className: 'cat-option',
        attrs: { type: 'button', 'data-cat': cat.key, 'aria-pressed': 'false', style: catStyle(cat) }
      });
      b.appendChild(el('span', { className: 'cat-chip-icon', html: cat.svg }));
      b.appendChild(document.createTextNode(cat.label));
      b.addEventListener('click', function () {
        select(pr.getAttribute('data-category') === cat.key ? '' : cat.key);
      });
      buttons[cat.key] = b;
      chips.appendChild(b);
    });

    wrap.appendChild(chips);
    wrap.appendChild(customInput);
    select(place.category && buttons[place.category] ? place.category : '', true);
    return wrap;
  }

  function buildPlaceRow(place) {
    place = place || {};
    var name = place.name, mapUrl = place.map_url, memo = place.memo;
    var pr = el('div', { className: 'place-input-row' });

    var catPicker = buildCategoryPicker(pr, place);

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

    pr.appendChild(catPicker);
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
        var catKey = pr.getAttribute('data-category') || '';
        if (catKey === 'custom') {
          var customEl = pr.querySelector('[data-place-category-label]');
          var customLabel = customEl ? customEl.value.trim() : '';
          if (customLabel) { place.category = 'custom'; place.category_label = customLabel; }
        } else if (catKey) {
          place.category = catKey;
        }
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

  function recordsFileText() {
    return 'const RECORDS = ' + JSON.stringify(records, null, 2) + ';\n';
  }

  function showExportPanel() {
    qs('#export-panel', modalOverlay).classList.remove('hidden');
    qs('#export-box', modalOverlay).value = recordsFileText();
  }

  /* ---------- 파일 내보내기 / 불러오기 (기기 간 공유) ---------- */
  function downloadRecordsFile() {
    var blob = new Blob([recordsFileText()], { type: 'text/javascript;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'records.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // records.js("const RECORDS = [...];") 또는 순수 JSON 배열 파일을 읽어 배열로 돌려준다.
  // 코드를 실행하지 않고 JSON으로만 해석한다 (앱이 내보낸 파일은 항상 JSON 호환).
  function parseRecordsText(text) {
    var s = String(text).replace(/^﻿/, '').trim();
    var start = s.indexOf('[');
    // 첫 '['와 짝이 맞는 ']'까지만 읽는다 (문자열 안의 괄호는 무시).
    // 파일 끝에 붙어버린 군더더기(예: 중복된 "];")가 있어도 앞의 완결된 배열만 쓴다.
    var end = -1;
    if (start !== -1) {
      var depth = 0, inStr = false;
      for (var i = start; i < s.length; i++) {
        var ch = s.charAt(i);
        if (inStr) {
          if (ch === '\\') i++;
          else if (ch === '"') inStr = false;
        } else if (ch === '"') {
          inStr = true;
        } else if (ch === '[') {
          depth++;
        } else if (ch === ']') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
    }
    if (start === -1 || end === -1) throw new Error('기록 목록([ ... ])을 찾을 수 없습니다.');
    var data;
    try {
      data = JSON.parse(s.slice(start, end + 1));
    } catch (e) {
      throw new Error('JSON 형식으로 읽을 수 없습니다. 앱에서 내보낸 records.js 파일인지 확인해주세요.');
    }
    if (!Array.isArray(data)) throw new Error('기록 목록이 배열이 아닙니다.');
    data.forEach(function (r, i) {
      if (!r || typeof r !== 'object' || !r.id || !r.start_date || !r.end_date ||
          !Array.isArray(r.countries) || !Array.isArray(r.cities)) {
        throw new Error((i + 1) + '번째 기록에 필수 항목(id, 국가, 도시, 시작일, 종료일)이 없습니다.');
      }
      if (!Array.isArray(r.days)) r.days = [];
      if (!Array.isArray(r.comments)) r.comments = [];
    });
    return data;
  }

  function importRecordsFile(file) {
    var reader = new FileReader();
    reader.onerror = function () { alert('파일을 읽지 못했습니다.'); };
    reader.onload = function () {
      var data;
      try {
        data = parseRecordsText(reader.result);
      } catch (e) {
        alert('불러오기 실패: ' + e.message);
        return;
      }
      var msg = '파일에 여행 기록이 ' + data.length + '개 있습니다.\n' +
        '이 브라우저의 현재 기록(' + records.length + '개)을 모두 지우고 파일 내용으로 덮어쓸까요?\n' +
        '(되돌릴 수 없으니 필요하면 먼저 "내보내기"로 백업하세요)';
      if (!confirm(msg)) return;
      records = data;
      if (!saveToStorage()) alert('브라우저 저장에 실패했습니다. 이번 화면에서만 반영됩니다.');
      if (document.body.getAttribute('data-page') === 'detail' &&
          !findRecord(new URLSearchParams(window.location.search).get('id'))) {
        window.location.href = 'index.html';
        return;
      }
      renderCurrentPage();
      alert('불러오기 완료: 여행 기록 ' + data.length + '개');
    };
    reader.readAsText(file, 'utf-8');
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

    var exportBtn = qs('#btn-export-file');
    if (exportBtn) exportBtn.addEventListener('click', downloadRecordsFile);

    var importBtn = qs('#btn-import-file');
    var importInput = qs('#input-import-file');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', function () { importInput.click(); });
      importInput.addEventListener('change', function () {
        var file = importInput.files && importInput.files[0];
        importInput.value = '';
        if (file) importRecordsFile(file);
      });
    }

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
