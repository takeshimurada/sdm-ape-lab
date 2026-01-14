# 📦 Cloudflare R2 완전 정리

## 🔍 R2가 뭔가요?

**Cloudflare R2**는 **파일 저장소(객체 스토리지)**입니다.

### 쉽게 설명하면:
- **드롭박스나 구글 드라이브 같은 클라우드 저장소**
- 하지만 **웹사이트에서 직접 사용**할 수 있도록 설계됨
- **S3 호환** (아마존 S3와 같은 방식으로 작동)

---

## 💰 크레딧 카드 저장 이유

### 무료 플랜이 있습니다!
- **무료 사용량**: 매월 10GB 저장 + 일일 1,000,000 읽기/쓰기
- **초과 시에만 요금 부과**
- 크레딧 카드는 **초과 사용 시 자동 결제**를 위해 필요

### 요금 구조:
- **저장**: $0.015/GB/월 (무료 10GB 이후)
- **읽기/쓰기**: 무료 한도 내에서 무료
- **송신료**: **$0 (무료!)** ← 이게 R2의 큰 장점

### 예상 비용:
- 방명록 + Archive 프로젝트 이미지 몇 개 = **거의 무료**
- 10GB는 이미지 수천 개를 저장할 수 있는 용량
- **일반적인 사용으로는 무료 플랜으로 충분**

---

## 🎯 R2의 주요 기능

### 1. 파일 저장
- 이미지, 비디오, 문서 등 모든 파일 저장
- **무제한 용량** (요금만 지불하면)

### 2. 파일 제공
- 저장된 파일을 URL로 접근 가능
- **전 세계 CDN**으로 빠르게 제공

### 3. API로 접근
- 코드에서 파일 업로드/다운로드 가능
- **S3 호환 API** 사용

---

## 🔐 Public Development URL이 뭔가요?

### Public Development URL
- R2 버킷의 파일에 **공개적으로 접근**할 수 있는 URL
- 형식: `https://<account-id>.r2.dev/<bucket-name>/<filename>`
- **개발/테스트용**으로 무료 제공
- 속도 제한이 있을 수 있음

### Custom Domain (프로덕션용)
- 자신의 도메인으로 파일 제공
- 예: `https://uploads.yoursite.com/image.jpg`
- **프로덕션 환경에서 권장**

---

## ✅ 지금 해야 할 것

### 1. Public Development URL 활성화
1. R2 버킷 → Settings (또는 General)
2. "Public Development URL" 섹션
3. **"Enable" 버튼 클릭**

### 2. R2 바인딩 (이미 했다면 생략)
1. Pages → Settings → Functions
2. R2 Bucket Bindings → Add binding
3. Variable name: `UPLOADS_R2`
4. R2 bucket: `sdm-ape-lab-uploads` 선택

---

## 🚨 주의사항

### 크레딧 카드
- **무료 플랜으로 충분하면 요금 부과 안 됨**
- 사용량 모니터링 가능 (Cloudflare Dashboard에서)
- 필요하면 알림 설정 가능

### Public Development URL
- **개발용**이므로 속도 제한 있을 수 있음
- 프로덕션에서는 Custom Domain 권장
- 하지만 지금은 Public Development URL로도 충분!

---

## 📊 사용량 확인 방법

1. Cloudflare Dashboard → R2
2. 버킷 선택 → Analytics 탭
3. 저장 용량, 읽기/쓰기 횟수 확인

---

## 🎉 요약

- **R2 = 클라우드 파일 저장소**
- **무료 플랜 있음** (10GB/월)
- **크레딧 카드는 초과 시 결제용** (일반 사용 시 요금 없음)
- **Public Development URL 활성화하면 파일 접근 가능**
