#!/usr/bin/env python3
"""최종 스위치 — 루프 A → B → C 순서를 강제한다.

앞 바퀴가 통과하기 전에는 뒤 바퀴를 판정하지 않는다.

사용법:
  python scripts/verify_all.py                 # A -> B -> C 전부
  python scripts/verify_all.py --skip-quality  # A -> B 만 (루프 C 회차 중 회귀 확인용)
"""
import os
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.abspath(__file__))


def run(script):
    result = subprocess.run([sys.executable, os.path.join(ROOT, script)])
    return result.returncode


def main():
    skip_quality = "--skip-quality" in sys.argv

    print("=== 1/3 루프 A: 기록 정보량 충족 ===")
    code = run("check_information_count.py")
    if code != 0:
        sys.exit(code)

    print("\n=== 2/3 루프 B: 화면 완성 ===")
    code = run("check_page_contract.py")
    if code != 0:
        sys.exit(code)

    if skip_quality:
        print("\n(--skip-quality 지정됨: 루프 C는 생략. 루프 A·B 회귀 확인용)")
        print("PASS (A·B)")
        sys.exit(0)

    print("\n=== 3/3 루프 C: 정성 완성도 ===")
    code = run("check_quality_passes.py")
    sys.exit(code)


if __name__ == "__main__":
    main()
