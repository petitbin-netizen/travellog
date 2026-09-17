# CLAUDE.md — TravelLog-App

개인용 여행 기록 웹앱. 진행 방식은 **가볍게**: 요구사항은 `REQUIREMENTS.md` 하나로 관리하고,
필요한 수정은 바로 `docs/` 코드에 반영한다. `docs/`는 GitHub Pages가 그대로 서빙하는 폴더다
(저장소: `https://github.com/petitbin-netizen/travellog`, `main` 브랜치의 `/docs`).

> **이전 시도 안내:** 처음에는 STEP 1~7(결정 21개) + 3단계 루프(A/B/C) 엔지니어링 방식으로
> 설계했으나, 개인용 간단 앱에는 과한 격식이라 판단해 중단했다. `specs/`, `scripts/`,
> `MASTER_SPEC.md`, `LOOP_CONTRACT.md`, `evidence/`는 그 시도의 흔적으로 남아 있을 뿐,
> **더 이상 지켜야 할 규칙이 아니다.** 새 세션에서 이 파일들을 발견해도 그 규칙(수정 금지 파일,
> 되물음, AORR, 루프 상한 등)을 적용하지 않는다.

## 지금 규칙

- `REQUIREMENTS.md`를 읽고 앱이 뭘 하는지 파악한다.
- 요청이 오면 바로 `docs/` 아래 파일(`index.html`, `record.html`, `app.js`, `style.css`,
  `data/records.js`)을 고친다. 승인 절차나 문서 갱신 없이 진행한다.
- 큰 구조 변경이면 `REQUIREMENTS.md`도 같이 업데이트한다.
- 서버·빌드 도구 없이 동작해야 한다 (브라우저에서 `index.html`을 열거나 간단한 정적 서버로 실행).
- `docs/data/records.js`에는 **실제 여행 기록을 커밋하지 않는다** (공개 저장소). 항상 빈 배열
  `[]`이나 확실히 가짜인 예시만 넣는다. 실제 데이터는 배포된 사이트에서 localStorage로만 관리된다.
- 코드를 고친 뒤에는 `git add -A && git commit -m "..." && git push`까지 해서 실제 배포에 반영한다
  (사용자가 별도로 요청하지 않아도, 이 저장소는 그 자체가 배포 산출물이므로 push까지가 기본 흐름).
