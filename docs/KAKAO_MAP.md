# 카카오맵 SDK 연동 가이드

하이록스 맵은 **카카오 지도 JavaScript API**를 사용합니다. REST API 키가 아니라 **JavaScript 키**가 필요합니다.

## 1. 카카오 개발자 앱 만들기

1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름(예: `hyrox-map-local`), 회사명 입력 후 저장

## 2. JavaScript 키 복사

1. 만든 앱 선택 → **앱 키** 메뉴
2. **JavaScript 키** 복사 (REST API 키 아님)

## 3. 플랫폼(도메인) 등록 — 필수

지도가 `localhost`에서 안 뜨는 가장 흔한 원인입니다.

1. **앱** → **플랫폼** → **Web** 플랫폼 등록
2. 사이트 도메인 추가:
   - 로컬: `http://localhost:3000`
   - 배포 후: `https://your-domain.ver.kr` (실제 도메인)

> `http://127.0.0.1:3000`만 쓰면 `localhost`와 별도로 등록해야 할 수 있습니다.

## 4. 지도 API 활성화

1. **제품 설정** → **카카오맵**
2. **활성화 설정** ON (비활성이면 스크립트 로드 실패)

## 5. 센터 썸네일 (사이드바 목록)

목록·상세 사진은 **카카오맵 장소 검색**으로 장소를 맞춘 뒤, **카카오맵 리뷰·매장 CDN 사진**을 우선 사용합니다. 카카오맵 리뷰 사진이 없고 실내 사진만 많은 장소(예: 위크로스핏 강남)는 **해당 장소 블로그 탭 첫 사진**을 네이버 Referer로 프록시합니다. 카카오맵 리뷰가 있는 곳은 블로그 사진을 쓰지 않습니다.

1. 같은 카카오 앱 → **앱 키** → **REST API 키** 복사 (JavaScript 키와 다름)
2. `.env` 또는 `.env.local`에 추가:

```env
KAKAO_REST_API_KEY=여기에_REST_API_키
```

3. **제품 설정** → **로컬** API 활성화
4. Vercel에도 `KAKAO_REST_API_KEY`를 **Production**에 추가 후 재배포

키가 없으면 기존처럼 시설명 첫 글자(예: W) 플레이스홀더가 표시됩니다.

---

## 6. 프로젝트 환경 변수

프로젝트 루트에 `.env.local` 생성 (git에 올리지 않음):

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=여기에_JavaScript_키_붙여넣기

# (선택) 로컬만 지도 끄기 — 느릴 때만
# NEXT_PUBLIC_DISABLE_MAP=1
```

- `NEXT_PUBLIC_` 접두사 → 브라우저에서 사용 가능
- `NEXT_PUBLIC_KAKAO_MAP_KEY`만 있으면 **로컬·배포 모두 지도 표시**
- `NEXT_PUBLIC_DISABLE_MAP=1` 이면 키가 있어도 플레이스홀더만 표시 (성능 테스트용)
- Vercel에는 **`NEXT_PUBLIC_DISABLE_MAP`을 설정하지 마세요**
- `.env` / `.env.local` 수정 후 **개발 서버 재시작** (`npm run dev`)

## 7. 코드 구조 (이 레포)

| 파일 | 역할 |
|------|------|
| `src/lib/kakao-map.ts` | SDK 스크립트 1회 로드 |
| `src/lib/kakao-place-photo.ts` | 장소 검색 → 첫 사진 URL |
| `src/app/api/venue-photo/route.ts` | 썸네일 API |
| `src/components/VenueThumbnail.tsx` | 목록 썸네일 |
| `src/types/kakao.maps.d.ts` | `window.kakao` 타입 |
| `src/components/KakaoMap.tsx` | 지도 + 마커 |
| `src/components/MapView.tsx` | `isKakaoMapEnabled()` → KakaoMap 또는 Placeholder |
| `src/app/page.tsx` | `MapView` 사용 |

## 8. 실행 확인

```bash
npm run dev
```

http://localhost:3000 접속 → 지도 타일·마커가 보이면 성공.

## 9. 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| 회색 박스만 보임 | 키 미설정 | `.env.local` + 서버 재시작 |
| 콘솔 `appkey` 오류 | 잘못된 키 | JavaScript 키인지 확인 |
| `document.domain` / 도메인 오류 | 플랫폼 미등록 | Web에 `http://localhost:3000` 등록 |
| 지도는 되는데 마커 없음 | venues API / DB | `npm run db:seed` |
| HTTPS 배포 후 안 됨 | 도메인 미등록 | Vercel URL을 플랫폼에 추가 |

## 10. 제보 폼에 지도 핀 (다음 단계)

제보 페이지에서 주소→좌표는 **카카오 로컬 REST API** 또는 **Geocoder**가 필요합니다. JavaScript 키와 별도로 REST API 키·로컬 API 활성화가 필요할 수 있습니다. MVP 제보 폼은 위도/경도 수동 입력을 유지합니다.

## 11. 참고 링크

- [카카오맵 Web API 문서](https://apis.map.kakao.com/web/documentation/)
- [지도 생성하기](https://apis.map.kakao.com/web/guide/)
