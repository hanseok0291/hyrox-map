# 하이록스 맵 — 시드 데이터 가이드

초기 지도 품질을 위해 **공식 HYROX 클럽**과 **시뮬레이션 가능 센터**를 수집·등록하는 절차입니다.

## 1. 데이터 소스

| 우선순위 | 소스 | 용도 | 주의 |
|---------|------|------|------|
| 1 | [HYROX 한국 — 체육관 찾기](https://hyroxsouthkorea.com/ko/%ED%95%98%EC%9D%B4%EB%A1%9D%EC%8A%A4-%EC%B2%B4%EC%9C%A1%EA%B4%80-%EC%B0%BE%EA%B8%B0/) | `trust_level: official` | robots/약관 확인 후 수동 CSV 권장 |
| 2 | 운영자 현장·경험 목록 | `source: curated` | 직접 검증한 곳만 |
| 3 | 블로그·인스타·당근 (교차검증) | 태그·드랍인 힌트 | 단독 소스로 official 부여 금지 |
| 4 | 사용자 제보 (검수 후) | `community_report` | [MODERATION.md](./MODERATION.md) |

**크롤링**: 공식 사이트 자동 수집 전 이용약관·robots 확인. MVP는 **수동 CSV → `npm run db:seed`** 권장.

---

## 2. 시드 JSON 스키마

파일: [`data/seed-venues.json`](../data/seed-venues.json)

```json
{
  "name": "시설명",
  "slug": "url-slug",
  "address": "도로명 주소",
  "region": "서울 강남구",
  "lat": 37.5,
  "lng": 127.0,
  "venue_type": "crossfit_box",
  "trust_level": "official",
  "source": "official",
  "tags": ["sled_push", "sled_pull", "rower"],
  "outdoor_run_note": "1km 코스 왕복 2.5회 (예시)",
  "drop_in_info": "토요일 시뮬 클래스, 드랍인 가능",
  "sim_price_single": "3만원 (시뮬 드랍인, 확인 필요)",
  "sim_price_double": null,
  "sim_price_relay": null,
  "price_note": "월 회원권 15만원대 (기타 참고)",
  "drop_in_available": true,
  "links": {
    "website": "",
    "instagram": "",
    "reservation": "",
    "naver_map": ""
  },
  "official_club_id": null
}
```

### `venue_type` 값

`official_club` | `crossfit_box` | `hyrox_center` | `gym` | `other`

### `tags` 값

`outdoor_run`, `indoor_run`, `sled_push`, `sled_pull`, `ski_erg`, `rower`, `wall_ball`, `farmers_carry`, `burpee_broad_jump`, `sandbag_lunge`, `full_stations` (레거시: `sled_push_pull` 표시만 지원)

---

## 3. 좌표 수집

1. 네이버 지도 / 카카오맵에서 주소 검색
2. `lat`/`lng` 소수점 6자리
3. 동일 건물 복수 체육관 — 핀 위치 10m 이상 차이 나게 조정
4. **네이버·카카오 좌표는 서로 다를 수 있음** — 지도는 카카오맵 기준이므로, 네이버만 본 경우 위치가 어긋날 수 있음. 수정은 상세 패널 **「지도 위치」 제보** 또는 Admin `/admin/venues/{slug}` (DB 필요)

---

## 4. 시드 등록 절차

```bash
# DB 마이그레이션 후
npm run db:push
npm run db:seed
```

- 중복 `slug`는 스킵
- `source: official`은 CSV에 `official_club_id` 또는 공식 목록 URL 메모 권장

---

## 5. 초기 시드 목록 (30곳)

`data/seed-venues.json`에 포함. 요약:

| 지역 | 공식/큐레이션 | 대표 시설 |
|------|-------------|----------|
| 서울 | 12 | F45 강남(공식 PC), 크로스핏무드 목동, 헤이데이 크로스핏(장한평) 등 |
| 경기·인천 | 5 | 크로스핏 리(강동), 인천 박스 등 |
| 부산·대구·대전·울산·광주 | 8 | 하이파이브 대전, 크로스핏튠 울산 등 |
| 호텔/웰니스 | 5 | 워커힐, 그랜드하얏트, 신라 등 (장비 위주, 드랍인 별도 확인) |

**헤이데이 크로스핏 (장한평)**: 사용자 제보 예시 — `outdoor_run` + 실내 스테이션, `trust_level: community`로 시드에 포함(운영자 검증 후 `verified` 상향 가능).

---

## 6. 품질 기준 (시드에도 적용)

- [ ] `full_stations`는 6개 이상 태그 + 코스 메모 있을 때만
- [ ] 드랍인 시뮬 비용은 **싱글·더블·릴레이** (`sim_price_*`) — 확인된 항목만, 모르면 `null`
- [ ] 회원권·일일권 등은 `price_note` (기타 참고)
- [ ] 호텔 피트니스는 `venue_type: gym`, 공식 클럽과 혼동 방지

---

## 7. 유지보수

| 주기 | 작업 |
|------|------|
| 월 1회 | 공식 클럽 CSV diff → 신규/폐업 반영 |
| 수시 | 제보 승인분은 Admin에서 개별 등록 (시드 JSON 수동 반영 선택) |
| 분기 | 태그 체계·필터 레이블 리뷰 |

---

## 8. 법적·표기

- 시드 `description`에 HYROX 상표 사용 시 “공식 트레이닝 클럽 (HYROX 한국 목록 기준)” 출처 명시
- 비공식 박스는 “하이록스 스타일 트레이닝/시뮬 가능” 표현 권장
