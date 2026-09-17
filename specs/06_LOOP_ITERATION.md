# STEP 6 — 반복 방법

> **한 줄 목적:** 실패하면 몇 번 더 돌고, 언제 멈추는지 정한다.
> **내가 결정할 것: 3개**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 5](05_TEST_AND_VERIFIER.md) | [STEP 7 — 실행 계약](07_EXECUTION_CONTRACT.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 3 — 이미 정해 둔 것

| 항목 | 고정값 |
| --- | --- |
| 루프 C 반복 | **정확히 3회.** 킷 고정, 결정 대상 아님 |
| 정성 규율 | `specs/QUALITY_RUBRIC.md` 핀터레스트 감성 10가지 |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-정보루프반복` | 루프 A 최대 몇 바퀴? | 루프 A 상한 |
| `D-페이지루프반복` | 루프 B 최대 몇 바퀴? | 루프 B 상한 |
| `D-무진전기준` | 같은 오류가 몇 번 반복되면 되물음을 띄우나? | 무진전 감지 |

**쉬운 선택지**

| 결정 ID | A | B | 권장 |
| --- | --- | --- | --- |
| `D-정보루프반복` | 2바퀴 | **3바퀴** | **B** |
| `D-페이지루프반복` | 2바퀴 | **3바퀴** | **B** |
| `D-무진전기준` | 1회 | **2회** | **B** |

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-정보루프반복`
- 고른 것: 직접 지정 — 2바퀴

### `D-페이지루프반복`
- 고른 것: 직접 지정 — 2바퀴

### `D-무진전기준`
- 고른 것: B (2회)

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

<!-- MACHINE:BEGIN -->
```json
{
  "step": 6,
  "produces": "spec_only",
  "iteration_contract": {
    "loop_A_limit": 2,
    "loop_B_limit": 2,
    "loop_C_limit": 3,
    "same_error_limit": 2,
    "failure_routing": {
      "CODE_ERROR": "RETRY",
      "TEST_ERROR": "HITL",
      "SPEC_CONFLICT": "REVISE_SPEC",
      "ENVIRONMENT_ERROR": "HITL",
      "PERMISSION_ERROR": "HITL",
      "INFORMATION_INSUFFICIENT": "RESEARCH",
      "UNKNOWN_ERROR": "STOP"
    }
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 · 8

바뀌는 파일: `specs/06_LOOP_ITERATION.md` · `specs/00_DECISION_LOG.md` · `specs/07_EXECUTION_CONTRACT.md`

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17)
<!-- STATUS:END -->

```text
STEP 7 진행해줘
```
