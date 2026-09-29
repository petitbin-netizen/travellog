# TravelLog — 요구사항

여행 다녀온 곳을 기록으로 남기는 개인용 웹앱. 서버 없이 브라우저에서 바로 연다.
GitHub Pages로 배포되어 있다 (`docs/` 폴더 = 배포되는 사이트 루트).

## 데이터 (`docs/data/records.js`)

```
TravelRecord {
  id, title(선택)
  countries[]      1개 이상 필수
  cities[]         1개 이상 필수
  start_date, end_date   필수
  cover_image      선택 (없으면 회색 placeholder). Add Travel 모달에서 이미지 URL을
                     붙여넣거나 로컬 사진을 선택하면 자동으로 작은 썸네일(최대 가로 640px,
                     JPEG)로 변환해 저장한다
  days[]           날짜 범위만큼. 각 day:
                     date       필수
                     map_url    선택 — 이 날 전체를 대표하는 지도 URL(예: 숙소 위치).
                                 embed 형태면 지도를 크게 보여줌, 아니면 링크
                     places[]   선택 — 하루에 "+ 장소 추가"로 원하는 만큼 추가.
                                 각 장소 { name, map_url(선택), memo(선택) }
                                 - map_url: 그 장소만의 구글맵 링크 (상세 화면에 "지도에서 보기" 링크로 표시)
                                 - memo: 그 장소에 대한 코멘트

  장소를 2개 이상 넣은 날은 상세 화면에 **"이 날짜 동선 보기 ↗"** 버튼이 생겨서,
  누르면 그날 장소들을 입력한 순서대로 이은 구글맵 길찾기(Directions) 링크가 새 탭에서 열린다
  (API 키 불필요). 각 장소는 자기 `map_url`에서 좌표/장소명을 뽑아 쓰고(`!3d..!4d..`, `?q=`,
  `/maps/place/이름/`, `@lat,lng` 순), 뽑을 수 없으면(예: 짧은 링크 `maps.app.goo.gl`, URL 없음)
  장소 이름 + 여행 도시명 검색으로 대체한다. 정확한 동선을 원하면 긴 형태의 구글맵 링크를 넣는다.

  "구글맵에서 찾기" 버튼(날짜/장소 칸 옆)을 누르면 새 탭에서 구글맵이 열리고(장소 이름 +
  도시/국가로 검색), 거기서 원하는 위치를 찾아 [공유] 링크를 복사해 입력 칸에 붙여넣으면 된다.
  comments[]       선택. { text(5자 이상), date(선택) }
  tags[]           선택
}
```

`records.js`는 최초 기본 데이터(baseline)다. 앱에서 "Add Travel"로 추가하거나 코멘트를
남기면 **그 브라우저의 localStorage에 자동 저장**되어, 새로고침해도 그대로 남는다.
(서버가 없으므로 저장은 이 브라우저 안에서만 유효 — 다른 기기·브라우저와는 공유되지 않는다.)

- 다른 기기에도 옮기고 싶으면: 모달의 "파일로 백업(선택)" 버튼으로 JSON을 복사해
  `records.js`에 붙여넣는다.
- `records.js` 파일을 직접 고쳤는데 화면에 반영이 안 되면: 헤더의
  "파일에서 다시 불러오기" 버튼으로 브라우저 저장분을 지우고 파일 내용을 다시 불러온다.

> **공개 저장소 주의**: `docs/data/records.js`는 GitHub 공개 저장소에 커밋되므로
> **여기에는 실제 여행 기록을 넣지 않는다** (지금은 빈 배열 `[]`). 실제 기록은 배포된
> 사이트에서 직접 "Add Travel"로 추가하면 각자 브라우저의 localStorage에만 저장된다.
> 진짜 데이터를 백업하고 싶으면 "파일로 백업" 결과를 **커밋하지 않는 개인 파일**로만 보관한다.

## 화면

- `index.html` — 핀터레스트 감성 매소너리 그리드로 여행 카드 목록. "+ Add Travel" 버튼.
- `record.html` — 날짜별 타임라인(그날의 지도·장소·코멘트). "수정" 버튼으로 편집 모달 재오픈.

## 디자인

배경 `#FAFAFA` · 텍스트 `#222222` · 포인트 컬러 `#9C8AD8` (파스텔 보라). 카드형, 넉넉한 여백,
호버 시 살짝 확대, 둥근 모서리, 이미지 우선 레이아웃.

## 모바일 · 배포

반응형으로 만들어져 있다 (좁은 화면에서 그리드 1열, 모달이 하단 시트처럼 표시, 입력창은
16px 이상이라 iOS에서 자동 확대 안 됨).

**GitHub Pages로 배포**: 저장소 `https://github.com/petitbin-netizen/travellog`,
`main` 브랜치의 `/docs` 폴더를 소스로 사용. 배포되면
`https://petitbin-netizen.github.io/travellog/`에서 폰이든 어디서든 접속 가능.

로컬에서 미리 보고 싶으면 `docs/` 폴더에서 `python -m http.server 8000` 실행 후
`http://localhost:8000` 접속.

## 지금 상태

기본 구현 완료: `docs/index.html`, `record.html`, `app.js`, `style.css`,
데이터는 빈 배열로 시작(`docs/data/records.js`). GitHub Pages 배포 준비 완료.

## 앞으로

기능 추가나 수정이 필요할 때마다 요청 → 바로 `docs/` 코드를 고치고 커밋·푸시하는 방식으로 진행.
(이전에 시도했던 STEP 1~7 / 3단계 루프 엔지니어링 방식은 개인 앱치고 과했다고 판단해 중단함.
`specs/`, `scripts/`, `MASTER_SPEC.md`, `LOOP_CONTRACT.md`, `evidence/`는 그 흔적으로 남아있지만
더 이상 지켜야 할 규칙이 아님.)
