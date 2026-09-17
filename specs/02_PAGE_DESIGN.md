# STEP 2 — 페이지 구성안

> **한 줄 목적:** 화면이 어떻게 생겼는지, 핀터레스트 감성이 구체적으로 무엇인지 정한다.
> **내가 결정할 것: 3개** · **코드 생성: 없음 (명세 문서만 바뀜)**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 1](01_INPUT_AND_STYLE.md) | [STEP 3 — 정보량 카운트](03_INFORMATION_COUNT.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 1 — 이 STEP에서 정하는 것

```text
페이지 구성    목록 / 상세 / 입력, 이 세 화면이 무엇을 보여주나
디자인 요구    "핀터레스트 감성"을 화면 요소로 번역하면 무엇인가
지도 연동      구글맵 URL을 화면에서 어떻게 다루나
```

---

## 읽기 2 — 앞에서 물려받은 결정

<!-- PROJECT:BEGIN -->

| 결정 ID | 값 (STEP 1에서) |
| --- | --- |
| `D-기록스키마` | 일정(trip) 최상위: countries[]·cities[](각 필수, 1개↑)·start_date·end_date(필수)·days[](date 필수, map_url 선택, places[] 선택)·comments[]·커버이미지·태그 |
| `D-저장방식` | `output/data/records.js` 사람이 직접 관리, 앱은 읽기 전용 |
| `D-앱형태` | 빌드 없는 순수 HTML/CSS/JS, `output/index.html` + `output/record.html` |

<!-- PROJECT:END -->

---

## 읽기 3 — 이미 정해 둔 것 (읽고 넘어가기)

| 항목 | 고정값 |
| --- | --- |
| 화면 이름표 | 검사기가 찾을 수 있게 `data-*` 속성을 붙인다 (예: `data-record-card`, `data-map-embed`) |
| 반응형 | 최소한 데스크톱 가로폭 기준으로 무너지지 않아야 한다 |
| 접근성 최소선 | 이미지에는 `alt` 텍스트를 둔다 |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-페이지구성` | 몇 개의 화면으로 나누고, 각각 무엇을 보여주나? | 화면 계약, 검사기가 찾는 요소 |
| `D-디자인요구` | 핀터레스트 감성을 구체적으로 무엇으로 정의하나? | 루프 C가 점검할 정성 규율 |
| `D-지도연동방식` | 구글맵 URL을 화면에서 어떻게 보여주나? | `data-map-embed` 계약 |

**쉬운 선택지**

| 결정 ID | A | B | C | 권장 |
| --- | --- | --- | --- | --- |
| `D-페이지구성` | 1화면(전부 한 페이지에 아코디언) | **2화면** (목록 + 상세, 입력은 상세 화면의 모달) | 3화면(목록/상세/입력 분리) | **B** |
| `D-디자인요구` | 자유 (규율 없이 알아서) | **명시적 10규율** (매소너리 그리드, 이미지 우선, 넉넉한 여백, 카드 그림자·호버, 무채색+포인트컬러 1개, 산세리프, 둥근 모서리, 텍스트 오버레이, 일관된 카드비율, 스크롤 시 자연스러운 로딩) | B + 다크모드 | **B** |
| `D-지도연동방식` | 텍스트 링크만("지도에서 보기") | **iframe 임베드 우선, 임베드 불가한 URL 형태면 링크로 폴백** | 좌표 직접 입력 후 자체 지도 렌더 | **B** (되물음에서 "URL 임베드/링크" 확정) |

> `D-페이지구성`에서 B를 고르면 화면은 2개(`index.html`, `record.html`)지만
> 입력/편집은 `record.html` 위의 모달(또는 인라인 폼)로 처리해 파일 수를 늘리지 않습니다.

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-페이지구성`
- 고른 것: B (2화면 + 모달 입력), **입력 진입점은 "Add Travel" 버튼으로 명명** (2026-09-17 수정)

```text
1) 목록 화면 (index.html)
   - 여행기록(일정) 카드들을 핀터레스트 매소너리 그리드로 나열
   - 카드 = 커버 이미지 + 제목 + 기간(start_date~end_date) + countries/cities 배지
   - 우상단 "+ Add Travel" 버튼 → 입력 모달 오픈
   - 카드 클릭 → record.html?id=... 로 이동

2) 상세 화면 (record.html)
   - 헤더: 제목·기간·countries·cities
   - 날짜별 타임라인 (핵심 화면): start_date~end_date 순서대로 day 카드를 나열
       각 day 카드 = 날짜 라벨 + (map_url 있으면) 그날의 구글맵 embed를 큼직하게
                     ("하루 동선을 한눈에") + 그날의 places[] 목록(이름·메모)
       map_url 이 없는 날은 지도 없이 장소 목록만(또는 "이 날은 이동 기록 없음")
   - 코멘트 섹션: comments[] 리스트 + 새 코멘트 추가 입력창
   - "수정" 버튼 → 입력 모달(기존 값 채워서 재오픈)

3) "Add Travel" 입력 모달 (index.html · record.html 공용, 별도 파일 아님)
   - STEP 1 필수: countries[] · cities[] · start_date · end_date
   - start_date~end_date 확정 즉시 그 범위만큼 day 입력 칸이 자동으로 펼쳐짐
   - 각 day 칸에서 map_url(선택)과 places(선택)를 "원하면" 추가
   - 저장 시 "JSON 내보내기" 버튼으로 records.js에 붙여넣을 텍스트 생성
```

### `D-디자인요구`
- 고른 것: B (명시적 10규율) — 상세 규율은 `QUALITY_RUBRIC.md`에 확정

```text
팔레트   배경 #FAFAFA, 텍스트 #222, 포인트 컬러 1개(다홍 #FF5A5F 또는 산호색 계열)
타이포   산세리프(Pretendard/시스템 폰트), 제목 굵게·본문 가볍게
그리드   CSS columns 또는 grid-auto-flow 기반 매소너리, 카드 간격 12~16px
카드     둥근 모서리(12px), 은은한 그림자, 호버 시 살짝 확대(1.02) + 그림자 강조
이미지   카드의 60% 이상을 이미지가 차지, 텍스트는 하단 오버레이 그라데이션 위에
여백     섹션 간 여백을 넉넉히 (본문보다 여백이 먼저 눈에 띄게)
```

### `D-지도연동방식`
- 고른 것: B, 단 **날짜(day)별 적용**으로 재확정 (2026-09-17 수정 — 되물음: "구글맵 embed를 크게 보여줌")

```text
day.map_url 은 선택 필드다 ("원하면 추가").
그 값이 구글맵 "지도 퍼가기(embed)" 형태(예: /maps/embed?... 또는 output=embed 포함)면
  → 그 day 카드 안에 <iframe data-map-embed> 를 크게(카드 폭 100%, 높이 충분히) 삽입
    → 이것이 "그 날짜의 동선을 한눈에 보는 이미지" 역할을 한다
그 외 형태(일반 공유 링크)면
  → 그 day 카드 안에 "구글맵에서 보기 →" 링크(새 탭), data-map-link 속성 부여
day.map_url 이 없는 날은 지도 영역 자체를 숨기고 장소 목록만 보여준다 (정상 상태)
여러 날짜의 embed가 화면에 순서대로 나열되므로, 위→아래로 스크롤하면 시간순 동선이 이어져 보인다
```

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

| 결정 ID | 확정 값 | 고른 이유 | 승인 시각 |
| --- | --- | --- | --- |
| `D-페이지구성` | 목록(그리드) + 상세(날짜별 타임라인·코멘트) + "Add Travel" 입력 모달 | 화면 2개로 단순하게, 입력 진입점을 요청한 이름("Add Travel")으로 명시 | 2026-09-17 (수정) |
| `D-디자인요구` | 핀터레스트 10규율 (팔레트·그리드·카드·여백 등) | "핀터레스트 감성"을 검사 가능한 규율로 번역 | 2026-09-17 |
| `D-지도연동방식` | 날짜(day)별 iframe 임베드 우선 + 링크 폴백, day.map_url은 선택 | 되물음에서 "구글맵 embed를 날짜 카드에 크게" 확정, API 키 불필요 | 2026-09-17 (수정) |

<!-- MACHINE:BEGIN -->
```json
{
  "step": 2,
  "produces": "spec_only",
  "decisions": {
    "D-페이지구성": {
      "screens": ["list", "detail"],
      "input": "modal_on_list_and_detail",
      "input_entry_label": "Add Travel",
      "list_layout": "masonry_grid",
      "detail_sections": ["header", "days_timeline", "comments"],
      "note": "지도는 별도 섹션이 아니라 days_timeline의 각 day card 안에 붙는다"
    },
    "D-디자인요구": {
      "palette": {"bg": "#FAFAFA", "text": "#222222", "accent": "#FF5A5F"},
      "font": "sans-serif (Pretendard/system)",
      "grid": "masonry",
      "card_radius_px": 12,
      "hover_scale": 1.02
    },
    "D-지도연동방식": {
      "applies_to": "each day.map_url (per-day, not per-place, not trip-level)",
      "embed_condition": "url contains '/maps/embed' or 'output=embed'",
      "embed_tag": "iframe[data-map-embed]",
      "fallback_tag": "a[data-map-link]",
      "map_url_required_per_day": false,
      "no_url_behavior": "hide_map_area_in_that_day_card"
    }
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 — 이 STEP이 끝나면 무엇이 진행되는가

| 항목 | 내용 |
| --- | --- |
| 지금 코드가 만들어지나? | 아니오. |
| 바뀌는 파일 | `specs/02_PAGE_DESIGN.md` · `specs/00_DECISION_LOG.md` · `specs/03_INFORMATION_COUNT.md` |
| 다음 명령 | "STEP 3 진행해줘" |

---

## 읽기 8 — 완료 확인과 다음 명령

- [ ] 목록·상세 화면이 요청한 기능("Add Travel"·국가/도시 필수·날짜별 선택 구글맵·코멘트)을 다 담는다
- [ ] 핀터레스트 감성이 "느낌"이 아니라 검사 가능한 규율로 적혀 있다
- [ ] 구글맵 URL 처리 방식(임베드/폴백)이 명확하다

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17)
<!-- STATUS:END -->

```text
STEP 3 진행해줘
```
