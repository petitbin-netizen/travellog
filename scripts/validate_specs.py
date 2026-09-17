#!/usr/bin/env python3
"""specs/ 문서의 STATUS 를 확인한다.

사용법:
  python scripts/validate_specs.py             # STEP 1~7 전부
  python scripts/validate_specs.py --step 3    # STEP 3 만
"""
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STEP_FILES = {
    1: "01_INPUT_AND_STYLE.md",
    2: "02_PAGE_DESIGN.md",
    3: "03_INFORMATION_COUNT.md",
    4: "04_BOUNDARY_TASKS_SAFETY.md",
    5: "05_TEST_AND_VERIFIER.md",
    6: "06_LOOP_ITERATION.md",
    7: "07_EXECUTION_CONTRACT.md",
}


def check_step(n):
    path = os.path.join(ROOT, "specs", STEP_FILES[n])
    if not os.path.exists(path):
        print(f"STEP {n}: ERROR (파일 없음: {STEP_FILES[n]})")
        return False
    text = open(path, encoding="utf-8").read()
    m = re.search(r"<!-- STATUS:BEGIN -->\s*STATUS:\s*(\S+)", text)
    status = m.group(1) if m else "UNKNOWN"
    ok = status == "APPROVED"
    print(f"STEP {n}: {status}" + ("" if ok else "  <- APPROVED 아님"))
    return ok


def main():
    if "--step" in sys.argv:
        idx = sys.argv.index("--step")
        n = int(sys.argv[idx + 1])
        ok = check_step(n)
        sys.exit(0 if ok else 2)

    all_ok = True
    for n in range(1, 8):
        if not check_step(n):
            all_ok = False
    sys.exit(0 if all_ok else 2)


if __name__ == "__main__":
    main()
