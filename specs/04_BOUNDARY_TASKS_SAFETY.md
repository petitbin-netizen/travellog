# STEP 4 — 경계·작업·안전

> **한 줄 목적:** 무엇을 작업 단위로 쪼개고, 무엇은 건드리면 안 되고, 언제 사람에게 물어보는지 정한다.
> **내가 결정할 것: 3개**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 3](03_INFORMATION_COUNT.md) | [STEP 5 — 테스트와 검증](05_TEST_AND_VERIFIER.md) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 2 — 앞에서 물려받은 결정

<!-- PROJECT:BEGIN -->
STEP 1~3의 스키마·화면·카운트 결정 전체 (요약은 `MASTER_SPEC.md` 완성 후 참조)
<!-- PROJECT:END -->

---

## 읽기 3 — 이미 정해 둔 것

| 항목 | 고정값 |
| --- | --- |
| 루프 개수와 순서 | A(정보량) → B(화면) → C(정성 완성도), 고정 |
| 검사기 소유 | 부트스트랩(STEP 5 직후 1회 생성) 이후 `scripts/**` 수정 금지 |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-작업목록` | 루프 A·B에 각각 어떤 작업을 두나? | 반복 단위 |
| `D-수정금지파일` | 어떤 파일을 보호하나? | 보호 파일 잠금 |
| `D-사람확인지점` | 어느 시점에 되물음을 띄우나? | 되물음 트리거 |

**쉬운 선택지**

| 결정 ID | A | B | 권장 |
| --- | --- | --- | --- |
| `D-작업목록` | 최소(루프A 2개, 루프B 2개) | **표준** (루프A: TASK-데이터스키마정의·TASK-샘플기록작성·TASK-검증로직 / 루프B: TASK-목록화면·TASK-상세화면·TASK-입력모달) | **B** |
| `D-수정금지파일` | `scripts/**`만 | **`specs/** scripts/** templates/** CLAUDE.md MASTER_SPEC.md LOOP_CONTRACT.md`** | **B** |
| `D-사람확인지점` | 루프 끝날 때만 | **루프 A 끝 · 루프 B 끝 · 루프 C 끝 (동일)** | **B** |

<!-- FIXED:END -->

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-작업목록`
- 고른 것: B

```text
루프 A: TASK-데이터스키마정의 → TASK-샘플기록작성 → TASK-검증로직구현
루프 B: TASK-목록화면구현 → TASK-상세화면구현 → TASK-입력모달구현
```

### `D-수정금지파일`
- 고른 것: B

### `D-사람확인지점`
- 고른 것: B

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

<!-- MACHINE:BEGIN -->
```json
{
  "step": 4,
  "produces": "spec_only",
  "tasks": {
    "loop_A": ["TASK-데이터스키마정의", "TASK-샘플기록작성", "TASK-검증로직구현"],
    "loop_B": ["TASK-목록화면구현", "TASK-상세화면구현", "TASK-입력모달구현"]
  },
  "protected_paths": ["specs/**", "scripts/**", "templates/**", "CLAUDE.md", "MASTER_SPEC.md", "LOOP_CONTRACT.md"],
  "human_checkpoints": ["loop_A_end", "loop_B_end", "loop_C_end"]
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 · 8

바뀌는 파일: `specs/04_BOUNDARY_TASKS_SAFETY.md` · `specs/00_DECISION_LOG.md` · `specs/05_TEST_AND_VERIFIER.md`

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17)
<!-- STATUS:END -->

```text
STEP 5 진행해줘
```
