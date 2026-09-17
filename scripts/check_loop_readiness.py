#!/usr/bin/env python3
"""루프를 시작해도 되는지 확인한다.

사용법:
  python scripts/check_loop_readiness.py           # READY 여부만 확인
  python scripts/check_loop_readiness.py --lock    # READY 면 scripts/.locked 표시를 남긴다
"""
import os
import sys

from _spec_kit import load_master_spec, ROOT

REQUIRED_KEYS = ("count_contract", "page_contract", "quality_contract", "loops", "options")
REQUIRED_SCRIPTS = (
    "check_information_count.py",
    "check_page_contract.py",
    "check_quality_passes.py",
    "verify_all.py",
)


def main():
    lock = "--lock" in sys.argv
    problems = []

    spec = load_master_spec()  # null이 있거나 MACHINE 블록이 깨지면 여기서 exit 1

    for name in REQUIRED_KEYS:
        if name not in spec:
            problems.append(f"MASTER_SPEC.md 에 {name} 없음")

    for s in REQUIRED_SCRIPTS:
        if not os.path.exists(os.path.join(ROOT, "scripts", s)):
            problems.append(f"scripts/{s} 없음 (부트스트랩 필요)")

    if problems:
        print("NOT_READY")
        for p in problems:
            print(f"  - {p}")
        sys.exit(2)

    print("READY")
    if lock:
        lock_path = os.path.join(ROOT, "scripts", ".locked")
        with open(lock_path, "w", encoding="utf-8") as f:
            f.write("scripts/ locked after STEP 5 bootstrap (see CLAUDE.md 5). Do not modify.\n")
        print("잠금 표시 생성: scripts/.locked")
    sys.exit(0)


if __name__ == "__main__":
    main()
