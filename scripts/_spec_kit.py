"""TravelLog-App 킷 공용 유틸리티.

scripts/ 전체와 함께 잠깁니다 (CLAUDE.md 5번). 통과가 안 된다고 이 파일을 고치지 않습니다.
기준을 바꾸려면 MASTER_SPEC.md 를 바꿉니다.
"""
import json
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_MACHINE_BLOCK_RE = re.compile(
    r"<!-- MACHINE:BEGIN -->\s*```json\s*(\{.*?\})\s*```\s*<!-- MACHINE:END -->",
    re.DOTALL,
)
_RECORDS_ARRAY_RE = re.compile(r"RECORDS\s*=\s*(\[[\s\S]*\])\s*;?")


def load_master_spec():
    path = os.path.join(ROOT, "MASTER_SPEC.md")
    if not os.path.exists(path):
        print("ERROR: MASTER_SPEC.md 를 찾을 수 없습니다")
        sys.exit(1)
    text = open(path, encoding="utf-8").read()
    m = _MACHINE_BLOCK_RE.search(text)
    if not m:
        print("ERROR: MASTER_SPEC.md 에서 검사 계약(MACHINE 블록)을 찾을 수 없습니다")
        sys.exit(1)
    try:
        spec = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        print(f"ERROR: MASTER_SPEC.md 의 MACHINE 블록이 올바른 JSON이 아닙니다: {e}")
        sys.exit(1)
    _check_no_null(spec)
    return spec


def _check_no_null(obj, path="spec"):
    if obj is None:
        print(f"ERROR: {path} 이 null 입니다. 명세가 아직 끝나지 않았습니다")
        sys.exit(1)
    if isinstance(obj, dict):
        for k, v in obj.items():
            _check_no_null(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _check_no_null(v, f"{path}[{i}]")


def load_records():
    """output/data/records.js (우선) 또는 records.json 을 읽는다.
    파일이 아직 없으면 None을 반환한다 (아직 정보를 안 채운 것 — ERROR가 아니라 SHORT)."""
    js_path = os.path.join(ROOT, "output", "data", "records.js")
    json_path = os.path.join(ROOT, "output", "data", "records.json")
    if os.path.exists(js_path):
        text = open(js_path, encoding="utf-8").read()
        m = _RECORDS_ARRAY_RE.search(text)
        if not m:
            print("ERROR: output/data/records.js 에서 RECORDS 배열을 찾을 수 없습니다")
            sys.exit(1)
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError as e:
            print(f"ERROR: records.js 의 데이터가 올바른 JSON이 아닙니다: {e}")
            sys.exit(1)
    if os.path.exists(json_path):
        try:
            return json.load(open(json_path, encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"ERROR: records.json 이 올바른 JSON이 아닙니다: {e}")
            sys.exit(1)
    return None


def is_map_url(u):
    return isinstance(u, str) and u.strip().lower().startswith("http") \
        and "google" in u.lower() and "map" in u.lower()


def is_embed_url(u):
    if not is_map_url(u):
        return False
    lu = u.lower()
    return "/maps/embed" in lu or "output=embed" in lu


def read_text(relpath):
    p = os.path.join(ROOT, relpath)
    if not os.path.exists(p):
        return None
    return open(p, encoding="utf-8").read()
