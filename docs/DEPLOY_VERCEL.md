# Vercel 배포 가이드

## 프로젝트를 따로 만들어야 하나요?

| 어디 | 필요 여부 | 설명 |
|------|----------|------|
| **Vercel 프로젝트** | ✅ 1개 필요 | 앱 하나 = Vercel 프로젝트 1개 (`hyrox-map` 등) |
| **GitHub 저장소** | ⭐ 권장 (필수 아님) | CLI로 폴더만 배포 가능. 이후 자동 배포는 GitHub 연동이 편함 |
| **Neon / Postgres** | ⭐ 권장 | 제보·Admin은 DB 필요. 없으면 **지도·목록만** 시드 JSON으로 동작 |

정리: **Vercel에서 새 프로젝트를 한 번 만들면 됩니다.** GitHub repo는 나중에 연결해도 됩니다.

---

## 방법 A — Vercel 웹 (가장 쉬움)

### 1. GitHub에 올리기 (권장)

```bash
cd /Users/leehanseok/study/hyrox-map
git init
git add .
git commit -m "Initial commit: Hyrox Map MVP"
# GitHub에서 새 repo 생성 후:
git remote add origin https://github.com/YOUR_USER/hyrox-map.git
git push -u origin main
```

### 2. Vercel에서 Import

1. https://vercel.com 로그인
2. **Add New…** → **Project**
3. GitHub 저장소 `hyrox-map` 선택 → **Import**
4. Framework: **Next.js** (자동 감지)
5. **Environment Variables** 추가:

| Name | Value | 비고 |
|------|-------|------|
| `ADMIN_SECRET` | 긴 랜덤 문자열 | Admin 로그인 |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | JavaScript 키 | [KAKAO_MAP.md](./KAKAO_MAP.md) |
| `DATABASE_URL` | Neon Postgres URL | 제보/Admin용 (아래 Neon 참고) |

6. **Deploy**

### 3. 카카오맵 Web 도메인

카카오 개발자 콘솔 → Web 플랫폼에 배포 URL 추가:

```
https://your-project.vercel.app
```

### 4. (선택) Neon DB — 제보·Admin

1. Vercel 프로젝트 → **Storage** → **Create Database** → **Neon**  
   또는 https://neon.tech 에서 무료 DB 생성
2. `DATABASE_URL`을 Vercel Environment Variables에 붙여넣기
3. **Redeploy** 후 Vercel 터미널 또는 로컬에서:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed
```

`prisma/schema.prisma`의 `provider`를 `postgresql`로 바꾼 뒤 위 명령을 실행하세요. (로컬은 계속 SQLite를 쓰려면 브랜치/스키마 분리 필요)

**DB 없이 배포한 경우**: 지도·시설 목록·상세는 `data/seed-venues.json` 폴백으로 동작합니다.

---

## 방법 B — Vercel CLI

```bash
cd /Users/leehanseok/study/hyrox-map
npx vercel login
npx vercel link    # 새 프로젝트 생성 또는 기존 연결
npx vercel env add ADMIN_SECRET
npx vercel env add NEXT_PUBLIC_KAKAO_MAP_KEY
npx vercel --prod
```

---

## 빌드

- `postinstall`: `prisma generate`
- `build`: `prisma generate && next build`
- Vercel은 `vercel.json`의 `buildCommand` 사용

---

## 체크리스트

- [ ] Vercel 프로젝트 생성
- [ ] `ADMIN_SECRET` 설정
- [ ] (선택) `NEXT_PUBLIC_KAKAO_MAP_KEY` + 카카오 Web 도메인
- [ ] (선택) `DATABASE_URL` + `db push` + `db:seed` — 제보/Admin
- [ ] 배포 URL 접속 → 시설 목록 표시 확인
