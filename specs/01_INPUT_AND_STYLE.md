# STEP 1 — 입력과 기록 구조

> **한 줄 목적:** 루프에게 "여행기록 한 건이 무엇으로 이루어지고, 어디에 저장되는지" 알려 준다.
> **내가 결정할 것: 3개** · **코드 생성: 없음 (명세 문서만 바뀜)**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| (첫 STEP) | [STEP 2 — 페이지 구성안](02_PAGE_DESIGN.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 1 — 이 STEP에서 정하는 것

```text
기록 스키마     여행기록 한 건에 어떤 칸이 있는가
저장 방식       그 기록을 어디에 어떤 형태로 두는가
앱 형태         서버 없이 어떻게 동작하는가
```

이 셋이 없으면 루프 A(정보량)가 무엇을 세야 할지 모릅니다.

---

## 읽기 2 — 앞에서 물려받은 결정

<!-- PROJECT:BEGIN -->
첫 STEP이라 물려받은 결정이 없습니다.
<!-- PROJECT:END -->

---

## 읽기 3 — 이미 정해 둔 것 (읽고 넘어가기)

| 항목 | 고정값 |
| --- | --- |
| 원문 요청 | [`USER_REQUEST.md`](../USER_REQUEST.md) |
| 프로젝트 관계 | 옆 `TravelLog` 프로젝트와 **별도**. 그 킷(scripts)을 가져오지 않는다 |
| 출력 언어 | 한국어 |
| 개인 기록 성격 | **출처·다건 검증 규칙 없음.** 내가 쓴 것을 그대로 신뢰한다 |
| 구글맵 | 내가 직접 만든 공유 URL을 그대로 쓴다. 손으로 지어내지 않는다 |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-기록스키마` | 여행기록 한 건에 어떤 필드를 담나? | 입력 폼 항목, 루프 A가 세는 대상 |
| `D-저장방식` | 그 기록을 어디에, 어떤 형태로 저장하나? | 루프 B가 읽어오는 방식, 배포 방법 |
| `D-앱형태` | 서버 없이 어떻게 여는가? | 실행 방법, 브라우저 제약 대응 |

**쉬운 선택지**

| 결정 ID | A | B | C | 권장 |
| --- | --- | --- | --- | --- |
| `D-기록스키마` | 최소형 (제목·기간·장소명만) | **표준형** (제목·국가/도시·기간·장소 리스트[이름·순서·메모]·구글맵 URL·코멘트 리스트·커버 이미지·태그) | 확장형(표준형 + 평점·예산·날씨) | **B** |
| `D-저장방식` | 브라우저 localStorage에만 저장 | **JSON 파일을 사람이 직접 관리**, 앱은 읽기만 | 서버 DB 연동 | **B** (되물음에서 이미 확정) |
| `D-앱형태` | React 등 빌드 도구 필요한 SPA | **순수 HTML/CSS/JS, 빌드 없음.** `file://`로 열거나 `python -m http.server`로 실행 | PWA(설치형) | **B** |

> `D-저장방식`을 B로 고르면, 앱 자체는 파일을 자동으로 쓰지 못합니다(서버가 없으므로).
> 그래서 입력 폼에서 "이 기록을 JSON으로 내보내기" 버튼을 누르면 사람이 그 내용을
> `output/data/records.json`에 붙여넣어 저장합니다. 이 흐름은 STEP 2에서 화면으로 확정합니다.

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-기록스키마`
- 고른 것: B (표준형) — **일정(여행 전체)이 최상위 단위**로 재확정 (2026-09-17 수정)

```text
TravelRecord {                       // "Add Travel" 로 만드는 여행 일정 한 건
  id                고유 id (자동 생성, 예: 타임스탬프 슬러그)
  title             여행 제목 (선택. 비우면 countries+기간으로 자동 생성)
  countries[]       국가 목록 (필수, 1개 이상. 단수/복수 모두 허용) — 예: ["이탈리아"]
  cities[]          도시 목록 (필수, 1개 이상. 단수/복수 모두 허용) — 예: ["로마","밀라노"]
                      ※ countries/cities는 국가별로 묶지 않고 여행 일정(trip) 아래
                        평평한 목록으로 둔다. "일정이 최상위, 그 안에 여러 국가/도시가
                        포함될 수도 있다"는 답변 반영
  start_date        전체 여행 시작일 (필수, YYYY-MM-DD)
  end_date          전체 여행 종료일 (필수, YYYY-MM-DD)
  cover_image       대표 이미지 URL (선택)
  days[]            start_date~end_date 범위에서 자동 생성되는 하루 단위 목록. 각 day:
                      {
                        date       그 날짜 (필수, start_date~end_date 사이)
                        map_url    그날의 구글맵 URL (선택 — "원하면 추가")
                                     embed 형태면 그 날짜 카드에 iframe으로 크게 표시해
                                     "하루 동선을 한눈에" 보여준다 (STEP 2에서 화면 확정)
                        places[]   그날 방문한 장소 목록 (선택). 각 장소:
                                     { name, memo(선택), order }
                      }
  comments[]        여행 전체에 대한 코멘트 (필요시). 각 코멘트:
                      { text, date(선택) }
  tags[]            자유 태그 (선택)
}
```

> 이전 초안에 있던 "장소마다 map_url 필수"는 폐기합니다. 지도 URL은 **날짜(day) 단위로,
> 선택적으로만** 붙입니다. 장소 이름 목록은 day 안에 그대로 유지합니다 (되물음에서 확정).

### `D-저장방식`
- 고른 것: B (JSON 파일 직접 관리)

```text
저장 위치 : output/data/records.json  (배열. TravelRecord 여러 건)
읽는 방식 : output/app.js 가 <script src="data/records.js">(JS 변수로 래핑) 또는
            fetch("data/records.json") 로 읽는다.
            file:// 로 열 때 fetch가 막히는 브라우저 대응을 위해
            기본은 "data/records.js" (const RECORDS = [...]; 형태)를 우선 사용하고,
            정적 서버로 띄울 때는 fetch(records.json)도 동작하게 둘 다 지원한다.
쓰는 방식 : 앱 안 입력 폼에서 "JSON으로 내보내기" 버튼 → 클립보드 복사/파일 다운로드 →
            사람이 output/data/records.js 를 직접 갱신한다. (서버가 없으므로 자동 저장 불가)
```

### `D-앱형태`
- 고른 것: B (순수 HTML/CSS/JS, 빌드 없음)

```text
output/index.html   목록 화면 (핀터레스트 그리드)
output/record.html  상세 화면 (지도·일정·코멘트) — 쿼리스트링으로 기록 id를 받음
output/app.js       공용 렌더링 로직
output/style.css    핀터레스트 감성 스타일
output/data/records.js   기록 데이터 (사람이 관리)
실행법: 더블클릭으로 index.html 열기(기본) 또는 `python -m http.server`로 열기(둘 다 지원)
```

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

| 결정 ID | 확정 값 | 고른 이유 | 승인 시각 |
| --- | --- | --- | --- |
| `D-기록스키마` | 일정(trip) 최상위: countries[]·cities[](각 1개 이상 필수)·start_date·end_date(필수)·days[](date 필수, map_url 선택, places[] 선택)·comments[]·커버이미지·태그 | "Add Travel 시 전체 일정·국가(들)·도시(들) 필수, map url은 날짜별 선택"이라는 요청 그대로 반영 | 2026-09-17 (수정) |
| `D-저장방식` | JSON 파일(`records.js`)을 사람이 직접 관리, 앱은 읽기 전용 | 되물음에서 "파일 기반" 확정 | 2026-09-17 |
| `D-앱형태` | 빌드 없는 순수 HTML/CSS/JS, 서버 불필요 | 되물음에서 "브라우저 웹앱, 서버 없음" 확정 | 2026-09-17 |

<!-- MACHINE:BEGIN -->
```json
{
  "step": 1,
  "produces": "spec_only",
  "decisions": {
    "D-기록스키마": {
      "fields": ["id","title","countries","cities","start_date","end_date",
                 "cover_image","days","comments","tags"],
      "countries_min": 1,
      "cities_min": 1,
      "day_fields": ["date","map_url","places"],
      "day_required_fields": ["date"],
      "day_optional_fields": ["map_url","places"],
      "place_fields": ["name","memo","order"],
      "place_required_fields": ["name"],
      "comments_item": ["text","date"]
    },
    "D-저장방식": {
      "kind": "file_managed_json",
      "path": "output/data/records.js",
      "fallback_json": "output/data/records.json",
      "write_flow": "app exports JSON -> human pastes into records.js"
    },
    "D-앱형태": {
      "kind": "static_no_build",
      "entry": ["output/index.html", "output/record.html"],
      "run_modes": ["file://", "python -m http.server"]
    }
  },
  "fixed": {
    "project_relation": "separate_from_TravelLog",
    "output_language": "한국어",
    "no_source_verification": true,
    "map_url_source": "user_provided_google_maps_share_url"
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 — 이 STEP이 끝나면 무엇이 진행되는가

| 항목 | 내용 |
| --- | --- |
| 지금 코드가 만들어지나? | 아니오. 명세 문서만 바뀝니다. |
| Claude가 실제로 하는 일 | ① 답을 결정 ID로 정리 → ② 읽기 6 채우기 → ③ 결정 장부에 추가 → ④ STEP 2·3의 물려받은 값 갱신 |
| 바뀌는 파일 | `specs/01_INPUT_AND_STYLE.md` · `specs/00_DECISION_LOG.md` · `specs/02_PAGE_DESIGN.md` · `specs/03_INFORMATION_COUNT.md` |
| 내가 지금 확인할 것 | 아래 체크리스트 → 문제 없으면 "STEP 2 진행해줘" |

---

## 읽기 8 — 완료 확인과 다음 명령

- [ ] 기록 스키마가 "일정 최상위 + 국가/도시 필수 + 날짜별 선택 map_url + 날짜별 장소" 구조를 담는다
- [ ] 저장 방식이 "파일 기반"이라는 확정 사항과 일치한다
- [ ] 앱 형태가 "서버 없음"이라는 확정 사항과 일치한다
- [ ] 상태가 `APPROVED`다

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17)
<!-- STATUS:END -->

```text
STEP 2 진행해줘
```
