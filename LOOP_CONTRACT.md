# LOOP_CONTRACT.md — 루프 실행 계약 (TravelLog-App)

이 파일은 **직접 쓰는 문서가 아닙니다.** STEP 7에서 확정된 결정을 실행 절차로 옮겨 적습니다.

---

## 0. 현재 상태

<!-- PROJECT:BEGIN -->
```text
상태: STEP 1~7 전부 APPROVED (2026-09-17). scripts/ 부트스트랩 완료·잠금.
      check_loop_readiness.py → READY. "루프를 실행해줘" 명령을 기다립니다.
```
<!-- PROJECT:END -->

---

## 1. 시작 조건 (전부 만족해야 시작)

- [ ] STEP 1~7 모두 `APPROVED` (현재: 사용자 최종 검토 대기 중)
- [ ] 결정 21개가 모두 값으로 확정
- [ ] `scripts/check_information_count.py` · `check_page_contract.py` · `check_quality_passes.py` · `verify_all.py` 부트스트랩 완료 및 잠금
- [ ] `MASTER_SPEC.md`의 검사 계약에 `null`이 없음
- [ ] `check_loop_readiness.py` → `READY` (exit 0)

---

## 2. 세 바퀴의 순서 (고정)

```text
┌──────────────────────── 루프 A · 기록 정보량 충족 ─────────────────────────┐
│  TASK-데이터스키마정의 → TASK-샘플기록작성 → TASK-검증로직구현              │
│  판정: python scripts/check_information_count.py                        │
│    exit 0  통과 → 되물음 → 루프 B 로                                    │
│    exit 2  부족 → RESEARCH(부족한 칸만) → 다시 판정                      │
│    exit 1  깨짐 → HITL                                                  │
└───────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────── 루프 B · 화면 완성 ────────────────────────────┐
│  TASK-목록화면구현 → TASK-상세화면구현 → TASK-입력모달구현                │
│  판정: python scripts/check_page_contract.py                          │
│    exit 0  통과 → 되물음 → 루프 C 로                                    │
│    exit 2  부족 → RETRY(부족한 칸만) → 다시 판정                        │
│    exit 1  깨짐 → HITL                                                  │
└───────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────── 루프 C · 정성 완성도 (핀터레스트 감성 3회) ──────┐
│  TASK-정성점검 × 3회 (킷 고정)                                          │
│    1회차 시각적 기본기 · 2회차 상호작용·예외 · 3회차 가독성·계약무결       │
│  판정: python scripts/check_quality_passes.py                         │
│    exit 0  3회 완료 → 되물음 → 사람이 브라우저로 확인 → SUCCESS          │
│    exit 2  덜 돔 → 남은 회차 진행 → 다시 판정                            │
│    exit 1  깨짐 → HITL                                                  │
└───────────────────────────────────────────────────────────────────────┘
```

앞 바퀴가 통과하기 전에는 뒤 바퀴를 판정하지 않습니다. `scripts/verify_all.py`가 강제합니다.

---

## 3. 실행 값

<!-- PROJECT:BEGIN -->

| 항목 | 값 | 출처 |
| --- | --- | --- |
| 루프 A 작업 순서 | `TASK-데이터스키마정의` → `TASK-샘플기록작성` → `TASK-검증로직구현` | `D-작업목록` |
| 루프 B 작업 순서 | `TASK-목록화면구현` → `TASK-상세화면구현` → `TASK-입력모달구현` | `D-작업목록` |
| 루프 A 판정 명령 | `python scripts/check_information_count.py` | `D-정보량테스트` |
| 루프 B 판정 명령 | `python scripts/check_page_contract.py` | `D-페이지테스트` |
| 루프 C 판정 명령 | `python scripts/check_quality_passes.py` | 킷 고정 |
| 루프 C 회차 | 3회 (최소이자 최대) | 킷 고정 |
| 최종 검증 명령 | `python scripts/verify_all.py` | `D-최종검증명령` |
| 성공 조건 | exit 0 + 사람이 브라우저로 확인 | `D-성공조건` |
| 루프 A 상한 | 2바퀴 | `D-정보루프반복` |
| 루프 B 상한 | 2바퀴 | `D-페이지루프반복` |
| 같은 오류 상한 | 2회 | `D-무진전기준` |
| 전체 반복 상한 | 5번 (⚠ 루프A/B 재시도가 있으면 루프C 3회를 못 마칠 수 있음) | `D-최대반복` |
| 되물음 지점 | 루프 A 끝 · 루프 B 끝 · 루프 C 끝 | `D-사람확인지점` |
| 보호 파일 | `specs/**` `scripts/**` `templates/**` `CLAUDE.md` `MASTER_SPEC.md` `LOOP_CONTRACT.md` | `D-수정금지파일` |

<!-- PROJECT:END -->

---

## 4. 실패 유형별 다음 행동 (고정)

| 실패 유형 | 다음 행동 |
| --- | --- |
| `CODE_ERROR` | `RETRY` |
| `TEST_ERROR` | `HITL` |
| `SPEC_CONFLICT` | `REVISE_SPEC` |
| `ENVIRONMENT_ERROR` | `HITL` |
| `PERMISSION_ERROR` | `HITL` |
| `INFORMATION_INSUFFICIENT` | `RESEARCH` |
| `UNKNOWN_ERROR` | `STOP` |

---

## 5. 종료 상태

`SUCCESS` · `HALT_NEEDS_HUMAN` · `HALT_NO_PROGRESS` · `HALT_SPEC_CONFLICT` · `HALT_PERMISSION` · `HALT_RESEARCH_GAP` · `HALT_ENVIRONMENT`

---

## 6. 증거와 보고

```text
evidence/runs/<run_id>/
  run_manifest.json  events.jsonl  test_results/  changes/
  quality/pass1.json  quality/pass2.json  quality/pass3.json
  failure_report.md (멈췄을 때)   final_report.md (끝났을 때)
```

---

## 7. 확인 명령

```bash
python scripts/check_loop_readiness.py
python scripts/verify_all.py
python scripts/verify_all.py --skip-quality      # 정성 회차 중에만
```
