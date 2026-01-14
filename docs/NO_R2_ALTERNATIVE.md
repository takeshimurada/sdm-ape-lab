# 🚫 R2 없이 파일 업로드하는 방법

## ⚠️ Cloudflare Pages의 제약사항

**Cloudflare Pages는 정적 호스팅**이므로:
- ❌ 서버가 없어서 파일을 직접 저장할 수 없음
- ❌ 파일 업로드 기능이 작동하지 않음
- ✅ R2 같은 객체 스토리지가 필요함

---

## ✅ R2 없이 사용하는 방법

### 방법 1: 로컬에서만 업로드 (추천)

1. **로컬 개발 환경에서 파일 업로드**
   - `npm run dev:full` 실행
   - 관리자 페이지에서 파일 업로드
   - 파일은 `public/uploads/` 폴더에 저장됨

2. **Git에 커밋하고 배포**
   ```bash
   git add public/uploads/
   git commit -m "Add uploaded files"
   git push origin main
   ```

3. **Cloudflare Pages 자동 배포**
   - GitHub에 푸시하면 자동 배포
   - 업로드된 파일들이 포함됨

**장점:**
- ✅ 완전 무료
- ✅ 요금 걱정 없음
- ✅ 제한 없음

**단점:**
- ❌ 웹에서 직접 업로드 불가
- ❌ Git 커밋 필요

---

### 방법 2: 다른 무료 호스팅 사용

#### Vercel
- 무료 플랜 있음
- 하지만 파일 업로드도 별도 스토리지 필요 (Vercel Blob)

#### Netlify
- 무료 플랜 있음
- 하지만 파일 업로드도 별도 스토리지 필요

**결론: 모든 정적 호스팅은 파일 업로드를 위해 별도 스토리지가 필요합니다.**

---

### 방법 3: 자체 서버 호스팅

- VPS (Virtual Private Server) 사용
- 예: AWS EC2, DigitalOcean, Linode 등
- 월 $5-10 정도

**장점:**
- ✅ 완전한 제어
- ✅ 파일 업로드 가능
- ✅ 요금 고정

**단점:**
- ❌ 서버 관리 필요
- ❌ 초기 설정 복잡

---

## 🎯 추천 방법

### 현재 상황에 맞는 방법: **방법 1 (로컬 업로드)**

1. **로컬에서 개발**
   ```bash
   npm run dev:full
   ```

2. **관리자 페이지에서 파일 업로드**
   - 파일은 `public/uploads/`에 저장됨

3. **Git에 커밋**
   ```bash
   git add public/uploads/
   git commit -m "Add new project files"
   git push origin main
   ```

4. **Cloudflare Pages 자동 배포**
   - GitHub 푸시 시 자동 배포
   - 업로드된 파일 포함

---

## 📝 Cloudflare Pages에서 업로드 비활성화

Cloudflare Pages에서는 파일 업로드 기능을 비활성화하고, 로컬에서만 사용하도록 안내 메시지를 표시할 수 있습니다.

이렇게 하면:
- ✅ R2 설정 불필요
- ✅ 요금 걱정 없음
- ✅ 로컬에서만 업로드 가능

---

## 💡 결론

**R2 없이 사용하려면:**
1. 로컬 개발 환경에서 파일 업로드
2. Git에 커밋
3. Cloudflare Pages 자동 배포

이 방법이 가장 간단하고 무료입니다!
