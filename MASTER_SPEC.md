# MASTER_SPEC.md — 승인된 결정 통합본 (TravelLog-App)

이 파일은 **직접 쓰는 문서가 아닙니다.** STEP 7에서 STEP 1~6의 승인된 결정을 모아 채웁니다.

**검사 스크립트는 숫자를 스스로 갖지 않습니다. 전부 이 파일에서 읽습니다.**

```text
MASTER_SPEC.md  count_contract / page_contract / quality_contract
        │  읽음 (STEP 5 승인 직후, 이 파일을 보고 scripts/ 를 부트스트랩 → 잠금)
        ├──▶  scripts/check_information_count.py   루프 A 판정
        ├──▶  scripts/check_page_contract.py       루프 B 판정
        ├──▶  scripts/check_quality_passes.py      루프 C 판정
        └──▶  scripts/verify_all.py                최종 스위치 (A → B → C)
```

---

## 0. 현재 상태

<!-- PROJECT:BEGIN -->
```text
상태: STEP 1~7 전부 APPROVED (2026-09-17, 사용자 승인). 결정 21개 확정.
      scripts/ 부트스트랩 완료 및 잠금(READY). 루프 실행 대기 중.
```
<!-- PROJECT:END -->

---

## 1. 결정 21개 통합표

<!-- PROJECT:BEGIN -->

| STEP | 결정 ID | 확정 값 |
| --- | --- | --- |
| 1 | `D-기록스키마` | 일정(trip) 최상위: countries[]·cities[](각 필수, ≥1)·start_date·end_date(필수)·days[](date 필수, map_url·places[] 선택)·comments[]·커버이미지·태그 |
| 1 | `D-저장방식` | `output/data/records.js` 사람이 직접 관리 |
| 1 | `D-앱형태` | 빌드 없는 순수 HTML/CSS/JS |
| 2 | `D-페이지구성` | 목록 + 상세(날짜별 타임라인) + "Add Travel" 입력모달 |
| 2 | `D-디자인요구` | 핀터레스트 10규율 |
| 2 | `D-지도연동방식` | 날짜(day)별 iframe 임베드 우선 + 링크 폴백, day.map_url은 선택 |
| 3 | `D-국가도시수` | 국가 최소 1개, 도시 최소 1개 |
| 3 | `D-코멘트분량` | 5자 |
| 3 | `D-필수필드` | countries[≥1]·cities[≥1]·start_date·end_date·days[≥1].date |
| 3 | `D-대표이미지규칙` | 필수 아님 |
| 4 | `D-작업목록` | 루프A 3개 / 루프B 3개 |
| 4 | `D-수정금지파일` | `specs/** scripts/** templates/** CLAUDE.md MASTER_SPEC.md LOOP_CONTRACT.md` |
| 4 | `D-사람확인지점` | 루프 A·B·C 끝 |
| 5 | `D-정보량테스트` | 개수와구조 |
| 5 | `D-페이지테스트` | 내용대조 |
| 5 | `D-최종검증명령` | `python scripts/verify_all.py` |
| 6 | `D-정보루프반복` | 2바퀴 |
| 6 | `D-페이지루프반복` | 2바퀴 |
| 6 | `D-무진전기준` | 2회 |
| 7 | `D-성공조건` | verify_all.py exit 0 + 사람이 브라우저 확인 |
| 7 | `D-최대반복` | 5번 |

<!-- PROJECT:END -->

---

## 2. 검사 계약 (스크립트가 읽는 곳)

<!-- MACHINE:BEGIN -->
```json
{
  "schema": {
    "record_fields": ["id","title","countries","cities","start_date","end_date",
                       "cover_image","days","comments","tags"],
    "countries_min": 1,
    "cities_min": 1,
    "day_fields": ["date","map_url","places"],
    "day_required_fields": ["date"],
    "place_fields": ["name","memo","order"],
    "place_required_fields": ["name"],
    "comment_fields": ["text","date"]
  },
  "storage": {
    "kind": "file_managed_json",
    "primary": "output/data/records.js",
    "fallback_json": "output/data/records.json"
  },
  "count_contract": {
    "min_records": 1,
    "countries_min": 1,
    "cities_min": 1,
    "comment_min_chars": 5,
    "required_fields": ["countries", "cities", "start_date", "end_date", "days"],
    "day_required_fields": ["date"],
    "day_optional_fields": ["map_url", "places"],
    "place_required_fields": ["name"],
    "cover_image_required": false,
    "map_url_field": "days[].map_url",
    "map_url_required": false,
    "strictness": "개수와구조"
  },
  "page_contract": {
    "output_files": ["output/index.html", "output/record.html", "output/app.js", "output/style.css"],
    "strictness": "내용대조",
    "list_screen": {
      "layout": "masonry",
      "card_selector": "[data-record-card]",
      "card_min_chars": {"title": 1}
    },
    "detail_screen": {
      "sections": ["header", "days_timeline", "comments"],
      "map_embed_selector": "[data-map-embed]",
      "map_link_selector": "[data-map-link]",
      "map_applies_to": "each day card inside days_timeline (not a separate map section, not per-place)",
      "embed_condition": "url contains '/maps/embed' or 'output=embed'",
      "day_selector": "[data-day-item]",
      "place_selector": "[data-place-item]",
      "comment_selector": "[data-comment-item]"
    },
    "theme": {"bg": "#FAFAFA", "text": "#222222", "accent": "#FF5A5F"}
  },
  "quality_contract": {
    "passes": 3,
    "rubric_file": "specs/QUALITY_RUBRIC.md",
    "record_dir": "evidence/runs/<run_id>/quality",
    "regression_command": "python scripts/verify_all.py --skip-quality",
    "rules": [
      "Q-그리드정렬", "Q-이미지우선", "Q-여백감각", "Q-호버반응", "Q-팔레트일관",
      "Q-빈기록처리", "Q-지도가독성", "Q-타임라인가독", "Q-코멘트가독", "Q-계약무결"
    ],
    "pass_focus": {
      "1": ["Q-그리드정렬", "Q-이미지우선", "Q-여백감각", "Q-팔레트일관"],
      "2": ["Q-호버반응", "Q-빈기록처리", "Q-지도가독성"],
      "3": ["Q-타임라인가독", "Q-코멘트가독", "Q-계약무결"]
    }
  },
  "loops": {
    "A": {"name": "기록 정보량 충족", "limit": 2, "verifier": "python scripts/check_information_count.py"},
    "B": {"name": "화면 완성", "limit": 2, "verifier": "python scripts/check_page_contract.py"},
    "C": {"name": "정성 완성도", "limit": 3, "verifier": "python scripts/check_quality_passes.py"}
  },
  "options": {
    "same_error_limit": 2,
    "max_iterations": 5,
    "final_verifier_command": "python scripts/verify_all.py",
    "success_condition": "verify_all.py exit 0 + 사람이 브라우저로 확인"
  }
}
```
<!-- MACHINE:END -->

> `null`이 남아 있으면 아직 명세가 끝나지 않은 것입니다. 위 블록에는 `null`이 없습니다 (초안 기준).

---

## 3. 이 파일이 완성되었는지 확인

STEP 7이 정식 승인되면 `python scripts/check_loop_readiness.py`를 실행합니다.
(이 스크립트는 STEP 5 부트스트랩 시점에 함께 생성됩니다.)
