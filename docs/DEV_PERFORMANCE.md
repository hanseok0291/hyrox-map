# 로컬 개발 성능 (느려짐 / 발열)

## 원인 (확인됨)

### 1. 잘못된 Next.js 워크스페이스 루트

상위 폴더에 `~/package-lock.json`이 있으면 Next/Turbopack이 **홈 디렉터리 쪽을 루트로 잡아** 파일 감시(watch) 범위가 비정상적으로 커질 수 있습니다.

**대응:** [`next.config.ts`](../next.config.ts)에서 `turbopack.root`, `outputFileTracingRoot`를 프로젝트 폴더로 고정.

### 2. 검색·필터마다 즉시 API + 카카오맵 마커 전체 재생성

한 글자 입력마다 `/api/venues` 호출 + 마커 31개 삭제/재생성이 반복되면 CPU·메모리 사용이 큽니다.

**대응:** [`useDebouncedValue`](../src/hooks/useDebouncedValue.ts)로 300~400ms 디바운스.

### 3. 카카오맵 SDK

지도 타일·WebGL + 마커 갱신은 로컬에서도 부담이 큽니다. (배포와 무관)

### 4. React Strict Mode (개발만)

개발 모드에서 `useEffect`가 두 번 실행될 수 있습니다.

---

## 권장 실행 방법

```bash
cd /Users/leehanseok/study/hyrox-map
rm -rf .next
npm run dev
```

기본은 **Webpack dev** (`npm run dev`). Turbopack이 필요하면 `npm run dev:turbo`.

### 추가로 적용된 완화 (2025-05)

- API·시드 데이터 **메모리 캐시** (`venues-store.ts`)
- 목록 **첫 로딩만** 스켈레톤, 이후 refetch는 목록 유지
- 거리·정렬만 바뀐 경우 `setVenues` 생략
- 카카오맵: `selectedId`·`center` **중복 pan/setCenter 방지**
- 지도 위 UI **`backdrop-blur` 제거** (GPU 부담 큼)
- KakaoMap **dynamic import** (초기 컴파일 분리)
- 개발 모드 `reactStrictMode: false` (effect 이중 실행 완화)

### 로컬 지도 켜기

| 항목 | 설정 |
|------|------|
| **필수** | `NEXT_PUBLIC_KAKAO_MAP_KEY` (JavaScript 키) — `.env` 또는 `.env.local` |
| **플랫폼** | 카카오 Developers → Web에 `http://localhost:3000` 등록 |
| **끄기 (선택)** | 느릴 때만 `.env.local`에 `NEXT_PUBLIC_DISABLE_MAP=1` |

Vercel Production 키를 로컬에 받기:

```bash
npx vercel env pull .env.vercel.prod --environment=production --yes
grep NEXT_PUBLIC_KAKAO_MAP_KEY .env.vercel.prod >> .env.local
rm .env.vercel.prod
npm run dev   # 재시작 필수
```

---

## 추가 팁

- `.next` 캐시가 꼬이면: `rm -rf .next` 후 `npm run dev`
- Prisma Studio는 안 쓸 때 끄기: `npm run db:studio`
- 동시에 `npm run dev` 여러 개 띄우지 않기
