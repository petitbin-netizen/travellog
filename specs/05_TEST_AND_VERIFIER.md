# STEP 5 — 테스트와 검증

> **한 줄 목적:** 무엇이 PASS를 판정하는지, 그리고 그 판정기를 **언제 만들어 잠그는지** 정한다.
> **내가 결정할 것: 3개**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 4](04_BOUNDARY_TASKS_SAFETY.md) | [STEP 6 — 반복 방법](06_LOOP_ITERATION.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 3 — 이미 정해 둔 것

```text
이 STEP이 APPROVED 되는 순간, scripts/ 부트스트랩이 실행된다.
MASTER_SPEC.md 의 count_contract·page_contract 만 보고 검사기 3개 + verify_all.py 를 만들고
그 즉시 잠근다 (CLAUDE.md 5번). 이후로는 "통과 안 되면 결과물을 고친다. 검사기를 고치지 않는다."
```

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-정보량테스트` | 루프 A는 무엇을 얼마나 깐깐하게 보나? | `check_information_count.py` 판정 기준 |
| `D-페이지테스트` | 루프 B는 무엇을 얼마나 깐깐하게 보나? | `check_page_contract.py` 판정 기준 |
| `D-최종검증명령` | 무엇을 실행하면 전체가 끝났다고 보나? | 종료 스위치 |

**쉬운 선택지**

| 결정 ID | A | B | 권장 |
| --- | --- | --- | --- |
| `D-정보량테스트` | 필수 필드 존재 여부만 | **필수 필드 + 최소 장소수(2) + 코멘트 최소 글자수 + 구글맵 URL 형식(있을 때만) 전부 검증** | **B** |
| `D-페이지테스트` | 화면 요소(`data-*`) 존재만 확인 | **요소 존재 + records 데이터 개수만큼 카드가 실제로 렌더되는지 + 상세화면 지도/타임라인/코멘트 내용대조** | **B** |
| `D-최종검증명령` | 자유 | **`python scripts/verify_all.py`** | **B** |

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-정보량테스트`
- 고른 것: B — "개수와구조" (필수 필드 + 최소 장소수 + 코멘트 분량 + URL 형식)

### `D-페이지테스트`
- 고른 것: B — "내용대조" (요소 존재 + 렌더링된 카드 수 = 기록 수 + 상세 내용 일치)

### `D-최종검증명령`
- 고른 것: B — `python scripts/verify_all.py`

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

<!-- MACHINE:BEGIN -->
```json
{
  "step": 5,
  "produces": "spec_only",
  "test_contract": {
    "loop_A": {"strictness": "개수와구조", "verifier": "python scripts/check_information_count.py"},
    "loop_B": {"strictness": "내용대조", "verifier": "python scripts/check_page_contract.py"},
    "exit_codes": {"0": "PASS", "1": "ERROR", "2": "SHORT"}
  },
  "final_verifier_command": "python scripts/verify_all.py",
  "bootstrap": {
    "trigger": "STEP 5 APPROVED",
    "action": "generate scripts/check_information_count.py, check_page_contract.py, check_quality_passes.py, verify_all.py from MASTER_SPEC.md only, then lock"
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 · 8

바뀌는 파일: `specs/05_TEST_AND_VERIFIER.md` · `specs/00_DECISION_LOG.md` · `specs/06_LOOP_ITERATION.md`

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17) — scripts/ 부트스트랩 진행
<!-- STATUS:END -->

```text
STEP 6 진행해줘
```
