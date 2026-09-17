# STEP 3 — 정보량 카운트

> **한 줄 목적:** 여행기록 한 건이 "완성"이라 부를 수 있는 최소 기준을 숫자로 정한다.
> **내가 결정할 것: 4개** · **코드 생성: 없음**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 2](02_PAGE_DESIGN.md) | [STEP 4 — 경계·작업·안전](04_BOUNDARY_TASKS_SAFETY.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 1 — 이 STEP에서 정하는 것

```text
국가·도시 최소수  Add Travel 시 국가·도시를 각각 최소 몇 개 받아야 하나
코멘트 분량      "간단한 코멘트"의 최소 글자수
필수 필드        무엇이 없으면 저장 자체를 막나
대표 이미지 규칙  커버 이미지가 꼭 있어야 하나
```

> `D-기록당장소수`(장소 개수 강제)는 폐기합니다. 장소·지도 URL이 날짜 단위 선택
> 항목이 되면서, 대신 **국가·도시 최소 개수**가 핵심 필수 조건이 되었습니다
> (2026-09-17 수정, 이름도 `D-국가도시수`로 변경).

---

## 읽기 2 — 앞에서 물려받은 결정

<!-- PROJECT:BEGIN -->

| 결정 ID | 값 |
| --- | --- |
| `D-기록스키마` | countries[]·cities[](각 필수)·start_date·end_date(필수)·days[]{date 필수, map_url 선택, places[] 선택}, comments[]{text, date} 포함 |
| `D-지도연동방식` | day.map_url 은 **선택**(날짜별로 원하면 추가), 형식에 따라 임베드/링크 |

<!-- PROJECT:END -->

---

## 읽기 3 — 이미 정해 둔 것 (읽고 넘어가기)

| 항목 | 고정값 |
| --- | --- |
| 검사 대상 | `output/data/records.js`(또는 `.json`) 안의 각 TravelRecord |
| 개인 기록 성격 | 다건 출처 검증 없음. 사람이 쓴 글자수·개수만 센다 |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-국가도시수` | 국가·도시를 각각 최소 몇 개 받아야 하나? | `countries`·`cities` 배열 최소 길이 |
| `D-코멘트분량` | 코멘트 한 건의 최소 글자수는? | `comments[].text` 최소 길이 |
| `D-필수필드` | 어떤 필드가 없으면 저장을 막나? | 스키마 검증 필수 목록 |
| `D-대표이미지규칙` | 커버 이미지가 꼭 있어야 하나? | `cover_image` 필수 여부 |

**쉬운 선택지**

| 결정 ID | A | B | 권장 |
| --- | --- | --- | --- |
| `D-국가도시수` | 국가·도시 각 최소 1개 | 국가 최소 1개, 도시 최소 2개(도시 간 이동감) | **A** ("단수 혹은 복수 모두 허용"이라는 요청과 일치) |
| `D-코멘트분량` | 제한 없음 | **최소 5자** ("좋았음"도 허용하는 느슨한 선) | **B** |
| `D-필수필드` | title만 | **countries(≥1)·cities(≥1)·start_date·end_date 필수, days[]는 날짜 범위로 자동 생성(day.date 필수)·day.map_url/day.places는 선택** | **B** |
| `D-대표이미지규칙` | 필수 아님(없으면 회색 placeholder) | 필수(반드시 URL 하나) | **A** |

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-국가도시수`
- 고른 것: A (국가·도시 각 최소 1개, 단수/복수 모두 허용)

### `D-코멘트분량`
- 고른 것: B (최소 5자, 코멘트 자체는 선택이지만 쓴다면 5자 이상)

### `D-필수필드`
- 고른 것: B

```text
필수: title은 선택(자동 생성 가능), countries(길이>=1), cities(길이>=1),
      start_date, end_date, days(길이>=1, 각 day.date 필수 — start_date~end_date 범위에서 자동 생성)
선택: cover_image, comments, tags, day.map_url, day.places, place.memo
```

### `D-대표이미지규칙`
- 고른 것: A (필수 아님, 없으면 회색 placeholder 카드로 표시)

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

| 결정 ID | 확정 값 | 이유 |
| --- | --- | --- |
| `D-국가도시수` | 국가 최소 1개, 도시 최소 1개 | "단수 혹은 복수" 요청을 그대로 최소 하한(1)으로 반영 |
| `D-코멘트분량` | 최소 5자 (선택 필드) | "간단한 코멘트"라는 요청 존중, 문턱만 최소로 |
| `D-필수필드` | countries[≥1]·cities[≥1]·start_date·end_date·days[≥1].date | Add Travel의 필수 항목(일정·국가·도시)만 강제, map_url·장소는 선택 |
| `D-대표이미지규칙` | 필수 아님 | 사진 없는 기록도 허용 |

<!-- MACHINE:BEGIN -->
```json
{
  "step": 3,
  "produces": "spec_only",
  "count_contract": {
    "countries_min": 1,
    "cities_min": 1,
    "comment_min_chars": 5,
    "required_fields": ["countries", "cities", "start_date", "end_date", "days"],
    "day_required_fields": ["date"],
    "day_optional_fields": ["map_url", "places"],
    "place_required_fields": ["name"],
    "cover_image_required": false,
    "cover_image_fallback": "placeholder_gray_card",
    "map_url_field": "days[].map_url",
    "map_url_required": false
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 — 이 STEP이 끝나면 무엇이 진행되는가

| 항목 | 내용 |
| --- | --- |
| 바뀌는 파일 | `specs/03_INFORMATION_COUNT.md` · `specs/00_DECISION_LOG.md` · `specs/04_BOUNDARY_TASKS_SAFETY.md` |
| 다음 명령 | "STEP 4 진행해줘" |

---

## 읽기 8 — 완료 확인과 다음 명령

- [ ] 숫자 기준이 전부 정해졌다 (null 없음)
- [ ] 필수/선택 필드 구분이 명확하다

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17)
<!-- STATUS:END -->

```text
STEP 4 진행해줘
```
