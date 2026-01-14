# 🔄 데이터 동기화 가이드

## ⚠️ 문제 상황

### 1. 방명록 데이터가 다른 이유
- **로컬**: `server.js`가 `public/guestbook-data.json` 파일을 읽고 씀
- **Cloudflare Pages**: KV를 사용하거나 정적 파일(`guestbook-data.json`)을 읽음
- **결과**: 두 저장소가 분리되어 있어서 데이터가 다름

### 2. 프로젝트가 안 올라가는 이유
- **로컬**: `server.js`가 `public/archive-data.json` 파일에 저장
- **Cloudflare Pages**: KV를 사용해야 하는데, KV가 없으면 정적 파일만 읽음
- **결과**: 로컬에서 저장한 데이터가 Cloudflare Pages에 반영되지 않음

---

## ✅ 해결 방법

### 방법 1: Git 커밋으로 동기화 (KV 없이 사용)

#### 로컬에서 데이터 저장 후:

1. **변경된 파일 확인**
   ```bash
   git status
   ```

2. **변경된 파일 커밋**
   ```bash
   git add public/archive-data.json public/guestbook-data.json
   git commit -m "Update archive and guestbook data"
   git push origin main
   ```

3. **Cloudflare Pages 자동 배포**
   - GitHub 푸시 시 자동 배포
   - 정적 파일이 업데이트됨

**장점:**
- ✅ KV 설정 불필요
- ✅ 완전 무료
- ✅ 간단함

**단점:**
- ❌ Git 커밋 필요
- ❌ 배포 시간 소요 (1-2분)

---

### 방법 2: KV 사용 (권장)

#### 초기 설정:

1. **Cloudflare Dashboard에서 KV 설정**
   - `GUESTBOOK_KV` 바인딩
   - `ARCHIVE_KV` 바인딩

2. **초기 데이터 마이그레이션**
   - 로컬의 `public/guestbook-data.json` 데이터를 KV에 복사
   - 로컬의 `public/archive-data.json` 데이터를 KV에 복사

3. **이후 동기화**
   - 로컬에서 저장 → 로컬 JSON 파일 업데이트
   - Cloudflare Pages에서 저장 → KV 업데이트
   - **두 저장소를 수동으로 동기화 필요**

**장점:**
- ✅ 웹에서 직접 저장 가능
- ✅ 즉시 반영

**단점:**
- ❌ KV 설정 필요
- ❌ 로컬과 Cloudflare Pages 데이터 분리

---

## 🎯 추천 방법: 하이브리드

### 로컬에서 작업할 때:
1. 로컬에서 데이터 저장
2. Git에 커밋하고 푸시
3. Cloudflare Pages 자동 배포

### Cloudflare Pages에서 작업할 때:
1. KV 사용 (설정 필요)
2. 즉시 반영

---

## 📝 현재 상태 확인

### 로컬 데이터 위치:
- `public/archive-data.json`
- `public/guestbook-data.json`

### Cloudflare Pages 데이터 위치:
- KV: `ARCHIVE_KV`, `GUESTBOOK_KV` (설정된 경우)
- 정적 파일: `archive-data.json`, `guestbook-data.json` (Git에서 배포된 버전)

---

## 🔧 빠른 해결책

### 지금 바로 동기화하려면:

1. **로컬에서 최신 데이터 확인**
   ```bash
   cat public/archive-data.json
   cat public/guestbook-data.json
   ```

2. **Git에 커밋**
   ```bash
   git add public/archive-data.json public/guestbook-data.json
   git commit -m "Sync local data to Cloudflare Pages"
   git push origin main
   ```

3. **Cloudflare Pages 배포 대기** (1-2분)

4. **KV 사용하는 경우**: Cloudflare Dashboard에서 KV에 데이터 수동 복사

---

## 💡 자동화 아이디어

로컬에서 저장할 때 자동으로 Git 커밋하는 스크립트를 만들 수 있습니다:

```bash
#!/bin/bash
# save-and-deploy.sh

# 데이터 저장 후
git add public/archive-data.json public/guestbook-data.json
git commit -m "Auto-sync: Update archive and guestbook data"
git push origin main

echo "✅ 데이터가 Cloudflare Pages에 배포 중입니다..."
```
