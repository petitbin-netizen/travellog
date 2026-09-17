# STEP 7 — 실행 계약

> **한 줄 목적:** 무엇이 되면 "끝"이라 부르는지 정한다. 이 STEP이 `APPROVED`되면 21개 결정이 완성된다.
> **내가 결정할 것: 2개**

| 이전 | 다음 | 문서 규칙 | 결정 장부 |
| --- | --- | --- | --- |
| [STEP 6](06_LOOP_ITERATION.md) | (없음 — 루프 실행 모드로) | [00_INDEX](00_INDEX.md) | [00_DECISION_LOG](00_DECISION_LOG.md) |

---

## 읽기 4 — 내가 결정할 질문

<!-- FIXED:BEGIN -->

| 결정 ID | 질문 | 이 값이 바꾸는 것 |
| --- | --- | --- |
| `D-성공조건` | 무엇이 되면 성공인가? | 최종 판정 |
| `D-최대반복` | 전체 반복 상한은? | 전체 종료 안전장치 |

**쉬운 선택지**

| 결정 ID | A | B | 권장 |
| --- | --- | --- | --- |
| `D-성공조건` | `verify_all.py` exit 0만 | **exit 0 + 사람이 브라우저로 실제 index.html/record.html을 열어 확인** | **B** |
| `D-최대반복` | 5번 | 10번 | (사용자가 5로 직접 지정) |

<!-- FIXED:END -->

> **주의.** 루프 A 상한 2 + 루프 B 상한 2 + 루프 C 고정 3회를 더하면 이론상 최대 7까지
> 필요할 수 있습니다. 전체 상한을 5로 두면, **루프 A·B에서 재시도가 한 번이라도 발생하면
> 루프 C의 고정 3회를 다 돌기 전에 상한(`HALT_NO_PROGRESS`류)에 걸릴 수 있습니다.**
> 재시도가 거의 없을 것으로 예상하고 타이트하게 두는 선택으로 이해하고 반영합니다.

---

## 읽기 5 — 내 답 적기

<!-- ANSWERS:BEGIN -->

### `D-성공조건`
- 고른 것: B

### `D-최대반복`
- 고른 것: 직접 지정 — 5번 (루프 A·B 재시도 없이 이상적으로 진행될 때의 최소치)

<!-- ANSWERS:END -->

---

## 읽기 6 — Claude가 정리한 결과

<!-- PROJECT:BEGIN -->

<!-- MACHINE:BEGIN -->
```json
{
  "step": 7,
  "produces": "spec_only",
  "execution_contract": {
    "success_condition": "verify_all.py exit 0 + human opens index.html/record.html in browser",
    "max_iterations": 5,
    "final_verifier_command": "python scripts/verify_all.py"
  }
}
```
<!-- MACHINE:END -->

<!-- PROJECT:END -->

---

## 읽기 7 — 이 STEP이 끝나면 무엇이 진행되는가

| 항목 | 내용 |
| --- | --- |
| 지금 코드가 만들어지나? | STEP 5 승인 시점에 **검사기(scripts/)만** 부트스트랩된다. 실제 앱(output/)은 여기 STEP 7 승인 후, 루프 실행 모드에서 만들어진다. |
| 바뀌는 파일 | `MASTER_SPEC.md` · `LOOP_CONTRACT.md` (STEP 1~7 통합) |
| 다음 명령 | "루프를 실행해줘" |

---

## 읽기 8 — 완료 확인과 다음 명령

- [ ] 21개 결정이 모두 값으로 채워졌다
- [ ] `MASTER_SPEC.md` / `LOOP_CONTRACT.md`가 채워졌다
- [ ] `scripts/` 부트스트랩이 완료되고 잠겼다

<!-- STATUS:BEGIN -->
STATUS: APPROVED (2026-09-17) — 21개 결정 확정. 루프 실행 모드로 전환
<!-- STATUS:END -->

```text
전체 21개 결정 검토 후 "STEP 1~7 승인" 또는 "D-XXX를 YYY로 바꾸고 싶어"
```
