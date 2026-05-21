# 하이록스 맵 (Hyrox Map)

내 근처에서 **하이록스 시뮬레이션·트레이닝**이 가능한 체육관/센터를 지도로 찾는 커뮤니티 서비스입니다.  
[야장맵](https://xn--r02bv4soub.kr/) 스타일의 테마 지도 + 검수 후 반영되는 사용자 제보를 지원합니다.

> 비공식 커뮤니티 프로젝트이며 HYROX 공식과 무관합니다.

## 문서

- [PRD](docs/PRD.md)
- [검수 가이드](docs/MODERATION.md)
- [시드 데이터](docs/DATA_SEED.md)
- [와이어프레임](docs/WIREFRAMES.md)

## 기술 스택

- Next.js 16 (App Router), Tailwind CSS 4
- Prisma + SQLite (로컬)
- Supabase Postgres 마이그레이션: `supabase/migrations/001_initial.sql`
- 카카오맵 SDK (`NEXT_PUBLIC_KAKAO_MAP_KEY`) — [연동 가이드](docs/KAKAO_MAP.md)

## 시작하기

```bash
cp .env.example .env
# .env 에 DATABASE_URL, ADMIN_SECRET 설정

npm install
npm run db:push
npm run db:seed
npm run dev
```

### 카카오맵 (선택)

```bash
# .env.local
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_키
```

플랫폼에 `http://localhost:3000` 등록 필수. 자세한 절차: **[docs/KAKAO_MAP.md](docs/KAKAO_MAP.md)**

- http://localhost:3000 — 지도·리스트
- http://localhost:3000/report — 시설 제보
- http://localhost:3000/admin/login — Admin (`ADMIN_SECRET`)

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run db:push` | Prisma 스키마 → DB |
| `npm run db:seed` | `data/seed-venues.json` 시드 (30곳) |
| `npm run db:studio` | Prisma Studio |

## API

- `GET /api/venues?lat=&lng=&q=&tags=&venueType=&dropIn=1`
- `GET /api/venues/[slug]`
- `POST /api/reports` — 제보 접수
- `GET /api/admin/reports` — Admin 제보 큐 (Bearer `ADMIN_SECRET`)
- `PATCH /api/admin/reports/[id]` — 승인/반려/보완

## 시드 데이터

`data/seed-venues.json`에 30개 시설(공식·큐레이션·커뮤니티 예시 포함).  
헤이데이 크로스핏(장한평) 등 사용자 제보 예시가 반영되어 있습니다.

## Vercel 배포

**Vercel 프로젝트 1개**만 만들면 됩니다 (GitHub repo는 권장).  
자세한 절차: **[docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)**

## 라이선스

Private study project.
