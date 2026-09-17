#!/usr/bin/env python3
"""루프 A 판정기 — 기록 정보량 충족.

킷 고정. 통과가 안 된다고 이 파일을 고치지 않는다. 기준을 바꾸려면 MASTER_SPEC.md 를 바꾼다.

exit 0  PASS   count_contract 기준을 다 채움
exit 1  ERROR  파일·명세가 깨짐
exit 2  SHORT  아직 덜 채움
"""
import sys

from _spec_kit import load_master_spec, load_records, is_map_url


def main():
    spec = load_master_spec()
    cc = spec["count_contract"]
    records = load_records()

    min_records = cc["min_records"]
    countries_min = cc["countries_min"]
    cities_min = cc["cities_min"]
    comment_min = cc["comment_min_chars"]
    required_fields = cc["required_fields"]
    day_required = cc["day_required_fields"]

    print("[루프 A] 기록 정보량 충족 검사")

    if records is None:
        print(f"채운 것: 0 / 최소 {min_records}건")
        print("못 채운 것: output/data/records.js (또는 records.json) 파일이 아직 없습니다")
        print("SHORT")
        sys.exit(2)

    if not isinstance(records, list):
        print("ERROR: records 최상위 구조가 배열이 아닙니다")
        sys.exit(1)

    problems = []
    ok = 0
    for idx, r in enumerate(records):
        if not isinstance(r, dict):
            problems.append((f"#{idx}", ["레코드가 객체가 아님"]))
            continue
        rid = r.get("id") or f"#{idx}"
        missing = []

        for f in required_fields:
            if f not in r or r[f] in (None, "", []):
                missing.append(f)

        countries = r.get("countries")
        if isinstance(countries, list) and len(countries) < countries_min:
            missing.append(f"countries(>={countries_min}개 필요, 현재 {len(countries)})")

        cities = r.get("cities")
        if isinstance(cities, list) and len(cities) < cities_min:
            missing.append(f"cities(>={cities_min}개 필요, 현재 {len(cities)})")

        days = r.get("days")
        if not isinstance(days, list) or len(days) < 1:
            missing.append("days(최소 1개 필요)")
        else:
            for di, d in enumerate(days):
                if not isinstance(d, dict):
                    missing.append(f"days[{di}]가 객체가 아님")
                    continue
                for df in day_required:
                    if df not in d or not d[df]:
                        missing.append(f"days[{di}].{df}")
                mu = d.get("map_url")
                if mu not in (None, "") and not is_map_url(mu):
                    missing.append(f"days[{di}].map_url 형식 오류 (구글맵 URL이어야 함)")
                for pi, p in enumerate(d.get("places") or []):
                    if not isinstance(p, dict) or not p.get("name"):
                        missing.append(f"days[{di}].places[{pi}].name")

        for ci, c in enumerate(r.get("comments") or []):
            text = (c or {}).get("text", "")
            if len(text) < comment_min:
                missing.append(f"comments[{ci}].text (최소 {comment_min}자 필요, 현재 {len(text)}자)")

        if missing:
            problems.append((rid, missing))
        else:
            ok += 1

    total = len(records)
    print(f"전체 기록: {total}건 (요구 최소 {min_records}건) · 조건 충족: {ok}건")
    if problems:
        print("못 채운 것:")
        for rid, missing in problems:
            print(f"  - {rid}: " + "; ".join(missing))

    if total < min_records:
        print("SHORT: 최소 기록 수를 채우지 못했습니다")
        sys.exit(2)
    if problems:
        print("SHORT: 일부 기록이 필수 조건을 채우지 못했습니다")
        sys.exit(2)

    print("PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
