# 서대문 유인원 연구회 | SDM APE LAB

인터랙티브 3D 얼굴 모델 기반 포트폴리오.

## Features

- 3D 얼굴 모델 인터랙션
- 커스텀 커서/글로우
- 스크램블 텍스트 애니메이션
- 아카이브/방명록
- 다국어 번역 UI (현재 하드코딩 텍스트)

## Run

```bash
npm install
npm run dev
```

Full stack (프론트+백엔드):

```bash
npm run dev:full
```

## Admin

- 열기: `Ctrl + Shift + A` (Mac: `Cmd + Shift + A`)
- 비밀번호: `sdmapelab2025`

## Admin Architecture

- 로컬: `server.js`가 `public/archive-data.json`, `public/guestbook-data.json`를 읽고/씀
- 로컬 업로드: `public/uploads/`에 저장, URL은 `/uploads/파일명`
- 배포(Pages): `functions/api/upload.js`가 **R2(UPLOADS_R2)** 로 업로드, 공개 URL 반환
- 업로드 가능 형식: JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime (최대 50MB)
- 수정/삭제: 관리자 페이지에서 항목 편집/삭제 시 JSON 갱신 + 업로드 파일 삭제 처리

## Structure

```
sdm-ape-lab/
├── src/
├── public/
├── functions/
├── docs/
├── scripts/
├── server.js
├── index.html
└── vite.config.ts
```
