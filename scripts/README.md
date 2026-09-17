# scripts/ — 부트스트랩 완료, 잠김

STEP 5 승인(2026-09-17) 직후 `MASTER_SPEC.md`의 `count_contract` · `page_contract` ·
`quality_contract`만 보고 아래 파일들을 만들고 **그 즉시 잠갔습니다.**
(`CLAUDE.md` 5번 — 부트스트랩 예외)

```text
_spec_kit.py                  공용 유틸리티 (MASTER_SPEC 읽기, records 파싱)
check_information_count.py    루프 A 판정기
check_page_contract.py        루프 B 판정기
check_quality_passes.py       루프 C 판정기
verify_all.py                 최종 스위치 (A → B → C)
check_loop_readiness.py       루프 시작 가능 여부 확인 (+ --lock)
validate_specs.py             specs/ STATUS 확인
```

**이제부터 통과가 안 된다고 이 파일들을 고치지 않습니다.** 결과물(`output/**`)을 고칩니다.
기준을 바꾸려면 `MASTER_SPEC.md`(그리고 그 근거가 되는 STEP 문서)를 바꿉니다.

`check_page_contract.py`에 대한 참고: 이 앱은 서버 없이 브라우저 JS로 렌더링되므로,
헤드리스 브라우저 없이 돌아가는 이 검사기는 "내용대조"를 **정적 소스 검사**로 구현합니다
(app.js가 요구된 data-* 렌더링 로직과 레코드 필드를 실제로 참조하는지, style.css가 요구된
팔레트·레이아웃을 선언하는지). 실제 화면이 의도대로 보이는지는 STEP 7의 성공 조건대로
**사람이 브라우저로 직접 열어 확인**해야 합니다.
