#!/usr/bin/env python3
"""루프 C 판정기 — 정성 완성도 (핀터레스트 감성) 3회.

품질에 점수를 매기지 않는다. 절차를 판정한다:
  3회를 다 돌았는가 / 회차마다 규율 10개를 전부 판정했는가 /
  위반이라 적은 것을 실제로 고쳤는가 (파일 해시로 확인) /
  회차 끝마다 루프 A·B가 여전히 통과하는가 (verify_all --skip-quality 기록)

킷 고정. 통과가 안 된다고 이 파일을 고치지 않는다. 기준을 바꾸려면 MASTER_SPEC.md 를 바꾼다.

exit 0  PASS   3회 완료
exit 1  ERROR  기록 파일이 깨짐
exit 2  SHORT  아직 덜 돔
"""
import json
import os
import sys

from _spec_kit import load_master_spec, ROOT


def latest_run_dir():
    base = os.path.join(ROOT, "evidence", "runs")
    if not os.path.isdir(base):
        return None
    runs = sorted(d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d)))
    return os.path.join(base, runs[-1]) if runs else None


def main():
    spec = load_master_spec()
    qc = spec["quality_contract"]
    passes_needed = qc["passes"]
    rules = set(qc["rules"])

    print("[루프 C] 정성 완성도 검사 (핀터레스트 감성, 정확히 %d회)" % passes_needed)

    run_dir = latest_run_dir()
    if run_dir is None:
        print(f"채운 회차: 0 / {passes_needed}")
        print("못 채운 것: evidence/runs/<run_id>/ 가 아직 없습니다")
        print("SHORT")
        sys.exit(2)

    quality_dir = os.path.join(run_dir, "quality")
    problems = []
    completed = 0

    for i in range(1, passes_needed + 1):
        p = os.path.join(quality_dir, f"pass{i}.json")
        if not os.path.exists(p):
            problems.append(f"pass{i}.json 없음")
            continue
        try:
            data = json.load(open(p, encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"ERROR: pass{i}.json 파싱 실패: {e}")
            sys.exit(1)

        local = []
        judged = set(data.get("judged_rules", []))
        if judged != rules:
            local.append(f"판정 안 한(또는 모르는) 규율 {sorted(rules - judged)}")

        if "snapshot_before" not in data or "snapshot_after" not in data:
            local.append("파일 해시(snapshot_before/after) 기록 없음")

        if "regression_exit_code" not in data:
            local.append("verify_all.py --skip-quality 실행 기록 없음")
        elif data["regression_exit_code"] != 0:
            local.append(f"회귀 검사 exit {data['regression_exit_code']} (0이어야 함)")

        applied_fix = data.get("applied_fix")
        if applied_fix is None:
            local.append("applied_fix 필드 없음 (고친 게 없으면 빈 리스트라도 있어야 함)")
        else:
            before = data.get("snapshot_before")
            after = data.get("snapshot_after")
            if applied_fix == [] and before is not None and before != after:
                local.append("고친 게 없다고 했는데 파일 해시가 바뀜")
            elif applied_fix and before is not None and before == after:
                local.append("고쳤다고 했는데 파일 해시가 그대로임")

        if local:
            problems.extend(f"pass{i}: {m}" for m in local)
        else:
            completed += 1

    print(f"채운 회차: {completed} / {passes_needed}")
    if problems:
        print("못 채운 것:")
        for p in problems:
            print(f"  - {p}")
        print("SHORT")
        sys.exit(2)

    print("PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
