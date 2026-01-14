# ✅ R2 설정 체크리스트

## 🎯 목표
로컬과 Cloudflare Pages 모두에서 **파일 업로드가 바로 작동**하도록 설정

---

## 📋 해야 할 작업 (순서대로)

### ✅ 1단계: R2 버킷 생성 (이미 했다면 생략)

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **R2 메뉴 찾기**
   - 왼쪽 사이드바: "R2" 또는 "Storage & databases" → "R2"
   - 또는 검색창에서 "R2" 검색

3. **"Create bucket" 클릭**
   - 버킷 이름: `sdm-ape-lab-uploads` (또는 원하는 이름)
   - Location: 가장 가까운 지역 선택 (예: Asia-Pacific)
   - "Create bucket" 클릭

---

### ✅ 2단계: R2 Public Development URL 활성화 (중요!)

1. **생성한 버킷 클릭**
   - `sdm-ape-lab-uploads` 버킷 선택

2. **"Settings" 탭 (또는 "General" 탭) 클릭**

3. **"Public Development URL" 섹션 찾기**
   - "Enable" 버튼 클릭
   - 활성화 완료!

**왜 필요한가?**
- Public Development URL이 활성화되어야 업로드한 파일에 접근할 수 있습니다
- 형식: `https://pub-<account-id>.r2.dev/<bucket-name>/<filename>`

---

### ✅ 3단계: Cloudflare Pages에 R2 바인딩

1. **Workers & Pages → Pages → sdm-ape-lab 프로젝트 선택**

2. **Settings 탭 → Functions 메뉴 클릭**

3. **R2 Bucket Bindings 섹션 찾기**
   - "Add binding" 버튼 클릭

4. **바인딩 설정**
   - **Variable name**: `UPLOADS_R2` (정확히 이 이름!)
   - **R2 bucket**: `sdm-ape-lab-uploads` 선택
   - **Save** 클릭

**왜 필요한가?**
- 이 바인딩을 통해 `functions/api/upload.js`에서 R2에 접근할 수 있습니다

---

### ✅ 4단계: 코드 배포 확인

코드는 이미 수정되어 있습니다:
- ✅ `functions/api/upload.js` - R2 사용하도록 수정됨
- ✅ `components/AdminPage.tsx` - Cloudflare Pages에서도 업로드 가능하도록 수정됨

**배포 확인:**
1. GitHub에 푸시되어 있는지 확인
2. Cloudflare Pages 자동 배포 대기 (1-2분)
3. 배포 완료 후 테스트

---

## 🧪 테스트 방법

### 로컬에서 테스트
1. `npm run dev:full` 실행
2. 관리자 페이지 접속 (`http://localhost:5173?admin=secret`)
3. 새 프로젝트 추가 → 파일 업로드 시도
4. ✅ 업로드 성공하면 완료!

### Cloudflare Pages에서 테스트
1. Cloudflare Pages 관리자 페이지 접속 (`https://...pages.dev?admin=secret`)
2. 새 프로젝트 추가 → 파일 업로드 시도
3. ✅ 업로드 성공하면 완료!

---

## ❌ 문제 해결

### "R2가 설정되지 않았습니다" 에러
- ✅ R2 버킷이 생성되어 있는지 확인
- ✅ Cloudflare Pages에 R2 바인딩이 되어 있는지 확인
- ✅ Variable name이 정확히 `UPLOADS_R2`인지 확인

### 파일이 업로드되지만 보이지 않음
- ✅ R2 Public Development URL이 활성화되어 있는지 확인
- ✅ R2 버킷에서 파일이 업로드되었는지 확인
- ✅ 브라우저 콘솔에서 에러 확인

### 업로드는 되지만 URL이 작동하지 않음
- ✅ R2 Public Development URL 형식 확인
- ✅ 파일명에 특수문자가 있는지 확인 (URL 인코딩 필요할 수 있음)

---

## 💰 비용 안내

### 무료 플랜
- **저장 용량**: 월 10GB
- **읽기**: 일일 1,000,000회
- **쓰기**: 일일 1,000,000회
- **송신료**: $0 (무료!)

### 예상 사용량
- 프로젝트 이미지 100개 (각 5MB) = 500MB
- 프로젝트 영상 10개 (각 50MB) = 500MB
- **총 1GB → 무료 플랜으로 충분!**

---

## ✅ 완료 체크리스트

- [ ] R2 버킷 생성 (`sdm-ape-lab-uploads`)
- [ ] R2 Public Development URL 활성화
- [ ] Cloudflare Pages에 R2 바인딩 추가 (`UPLOADS_R2`)
- [ ] 코드 배포 확인
- [ ] 로컬에서 업로드 테스트
- [ ] Cloudflare Pages에서 업로드 테스트

---

## 🎉 완료 후

이제 **로컬과 Cloudflare Pages 모두에서 파일 업로드가 바로 작동**합니다!

- ✅ 파일 선택 → 업로드 → 저장 끝!
- ✅ Git 커밋 불필요
- ✅ URL 복사/붙여넣기 불필요
