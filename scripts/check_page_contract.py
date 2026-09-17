#!/usr/bin/env python3
"""루프 B 판정기 — 화면 완성.

이 앱은 서버 없이 브라우저에서 JS로 렌더링되므로(정적 HTML에 내용이 미리 박혀 있지 않음),
헤드리스 브라우저 없이 실행되는 이 검사기는 "내용대조"를 다음처럼 구현한다:
  1) 필요한 산출물 파일이 다 있는가
  2) app.js 가 요구된 data-* 렌더링 로직·레코드 필드 참조를 실제로 갖고 있는가
     (하드코딩된 더미 내용이 아니라 레코드 데이터를 그대로 바인딩하는지의 최소 증거)
  3) style.css 가 요구된 팔레트·레이아웃 규칙을 선언하는가
  4) index.html/record.html 이 app.js·데이터 파일을 실제로 로드하는가

킷 고정. 통과가 안 된다고 이 파일을 고치지 않는다. 기준을 바꾸려면 MASTER_SPEC.md 를 바꾼다.

exit 0  PASS   page_contract 기준을 다 채움
exit 1  ERROR  파일·명세가 깨짐
exit 2  SHORT  아직 덜 채움
"""
import re
import sys

from _spec_kit import load_master_spec, load_records, read_text


def selector_name(sel):
    return re.sub(r"^\[data-|\]$", "", sel).strip()


def main():
    spec = load_master_spec()
    pc = spec["page_contract"]
    records = load_records()

    print("[루프 B] 화면 완성 검사")

    missing = []
    files_needed = pc["output_files"]
    file_texts = {}
    for f in files_needed:
        txt = read_text(f)
        if txt is None:
            missing.append(f"파일 없음: {f}")
        else:
            file_texts[f] = txt

    if missing:
        print("못 채운 것:")
        for m in missing:
            print(f"  - {m}")
        print("SHORT")
        sys.exit(2)

    app_js = file_texts.get("output/app.js", "")
    style_css = file_texts.get("output/style.css", "")
    index_html = file_texts.get("output/index.html", "")
    record_html = file_texts.get("output/record.html", "")

    list_screen = pc["list_screen"]
    detail = pc["detail_screen"]
    theme = pc["theme"]

    required_selectors = {
        "card": selector_name(list_screen["card_selector"]),
        "map_embed": selector_name(detail["map_embed_selector"]),
        "map_link": selector_name(detail["map_link_selector"]),
        "day": selector_name(detail["day_selector"]),
        "place": selector_name(detail["place_selector"]),
        "comment": selector_name(detail["comment_selector"]),
    }
    for name, sel in required_selectors.items():
        if sel not in app_js:
            missing.append(f"app.js 에 {sel} 렌더링 로직이 없음 ({name})")

    referenced_fields = ["title", "countries", "cities", "days", "map_url", "places", "comments"]
    for field in referenced_fields:
        if f".{field}" not in app_js and f'"{field}"' not in app_js and f"'{field}'" not in app_js:
            missing.append(f"app.js 가 레코드의 {field} 필드를 참조하지 않는 것으로 보임")

    if list_screen["layout"] == "masonry":
        if not re.search(r"columns|grid-template|masonry", style_css, re.IGNORECASE):
            missing.append("style.css 에 매소너리/그리드 레이아웃 규칙이 없음")

    for key in ("bg", "text", "accent"):
        color = theme[key]
        if color.lower() not in style_css.lower():
            missing.append(f"style.css 에 팔레트 색상 {color} 이 없음")

    if "app.js" not in index_html:
        missing.append("index.html 이 app.js 를 불러오지 않음")
    if "app.js" not in record_html:
        missing.append("record.html 이 app.js 를 불러오지 않음")
    if not re.search(r"records\.js|records\.json", index_html + record_html):
        missing.append("index.html/record.html 이 기록 데이터 파일을 참조하지 않음")

    if records:
        if not re.search(r"\.(map|forEach)\s*\(", app_js):
            missing.append("app.js 에 레코드 배열을 순회하며 렌더링하는 반복 로직이 보이지 않음")

    print(f"검사한 파일: {', '.join(files_needed)}")
    if missing:
        print("못 채운 것:")
        for m in missing:
            print(f"  - {m}")
        print("SHORT")
        sys.exit(2)

    print("PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
