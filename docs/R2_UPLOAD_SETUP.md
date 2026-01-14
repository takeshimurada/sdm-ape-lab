# 📤 Cloudflare R2 파일 업로드 설정 가이드

## ✅ R2 설정하면 가능한 것

- ✅ **제한 없는 파일 업로드** (이미지, 비디오)
- ✅ **50MB까지 업로드 가능**
- ✅ **모든 유저가 업로드한 파일 저장**
- ✅ **무료 플랜으로 충분함** (일일 10GB 저장, 1,000,000 읽기/쓰기)

---

## 📋 설정 단계

### 1단계: Cloudflare R2 버킷 생성

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **R2 메뉴 찾기**
   - 왼쪽 사이드바에서 "R2" 또는 "Storage & databases" → "R2" 클릭
   - 또는 검색창에서 "R2" 검색

3. **"Create bucket" 클릭**
   - 버킷 이름: `sdm-ape-lab-uploads` (또는 원하는 이름)
   - Location: 가장 가까운 지역 선택
   - "Create bucket" 클릭

---

### 2단계: R2 Public Access 설정 (선택사항)

업로드된 파일을 직접 URL로 접근하려면:

1. 생성한 버킷 클릭
2. "Settings" 탭
3. "Public Access" 섹션에서 "Allow Access" 활성화
4. "Allow List" 또는 "Allow Get" 선택
5. Save

---

### 3단계: Cloudflare Pages 프로젝트에 R2 바인딩

1. **Workers & Pages → Pages → sdm-ape-lab 프로젝트 선택**

2. **Settings 탭 → Functions 메뉴**

3. **R2 Bucket Bindings 섹션에서 "Add binding" 클릭**
   - **Variable name**: `UPLOADS_R2` (코드에서 사용할 이름)
   - **R2 bucket**: 위에서 생성한 `sdm-ape-lab-uploads` 선택
   - **Save** 클릭

---

### 4단계: 코드 추가

`functions/api/upload.js` 파일을 생성해야 합니다.

---

## 💰 비용

### 무료 플랜 (Free Plan)
- **저장**: 일일 10GB
- **읽기**: 일일 1,000,000회
- **쓰기**: 일일 1,000,000회
- **Class A Operations**: 일일 1,000,000회
- **Class B Operations**: 일일 10,000,000회

### 방명록 사용량 예상
- 일일 방문자 1,000명 가정
- 각 방문자가 10개 파일 업로드 = 10,000 쓰기
- **무료 플랜으로 충분함!**

---

## ✅ 설정 완료 후

1. **코드 추가 후 GitHub에 푸시**
2. **Cloudflare Pages 자동 배포 대기** (1-2분)
3. **테스트**: 관리자 페이지에서 파일 업로드 시도

---

## 🔍 문제 해결

### R2가 작동하지 않는 경우
1. Cloudflare Dashboard에서 R2 바인딩 확인
2. Variable name이 `UPLOADS_R2`인지 확인
3. Functions 로그 확인 (Cloudflare Dashboard → Pages → Functions → Logs)

### 파일이 보이지 않는 경우
1. R2 버킷에서 파일이 업로드되었는지 확인
2. Public Access가 설정되었는지 확인
3. URL이 올바른지 확인

---

## 📝 참고사항

- R2는 **S3 호환 API**를 사용
- **전역적으로 분산**되어 있어 매우 빠름
- **무료 플랜으로도 충분히 사용 가능**
