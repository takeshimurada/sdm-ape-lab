# 🚀 실시간 업데이트 관리자 가이드

## ✨ **새로운 기능!**

이제 **관리자 페이지에서 프로젝트를 추가/수정하면 JSON 파일을 수동으로 업로드할 필요 없이 즉시 반영**됩니다! 🎉

---

## 📡 **시스템 구조**

```
┌─────────────────────┐
│   프론트엔드 (Vite) │  ← 사용자가 보는 화면
│   Port: 3005        │
└──────────┬──────────┘
           │ API 호출
           ↓
┌─────────────────────┐
│   백엔드 (Express)  │  ← 파일 저장/불러오기
│   Port: 3001        │
└──────────┬──────────┘
           │ 파일 읽기/쓰기
           ↓
┌─────────────────────┐
│  public/            │
│  ├─ archive-data.json  ← Archive 데이터
│  └─ uploads/           ← 업로드된 이미지/비디오
└─────────────────────┘
```

---

## 🎯 **사용 방법**

### **1️⃣ 서버 시작**

두 가지 방법이 있습니다:

#### **방법 A: 자동 스크립트 (권장)**
```bash
cd /home/user/webapp
./start-dev.sh
```

#### **방법 B: 수동 실행**
```bash
# 터미널 1: 백엔드 서버
cd /home/user/webapp
node server.js

# 터미널 2: 프론트엔드 서버
cd /home/user/webapp
npm run dev
```

---

### **2️⃣ 관리자 페이지 접속**

1. 웹사이트 열기: https://3005-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai
2. **Ctrl + Shift + A** 누르기 (Mac: Cmd + Shift + A)
3. 비밀번호 입력: `sdmapelab2025`
4. ✅ 관리자 페이지 진입!

---

### **3️⃣ 프로젝트 추가하기**

#### **A. 파일 업로드 방식 (권장)**

1. **+ 새 프로젝트 추가** 버튼 클릭
2. **파일 업로드** 버튼 클릭
3. 컴퓨터에서 이미지 또는 비디오 선택
4. ⏳ 업로드 완료 대기 (자동으로 서버에 저장됨)
5. 제목, 태그, 연도 입력
6. **💾 저장** 버튼 클릭
7. ✅ **즉시 반영!** Archive 탭에서 바로 확인 가능

#### **B. 외부 URL 방식**

1. **+ 새 프로젝트 추가** 버튼 클릭
2. **또는 URL 직접 입력** 필드에 URL 붙여넣기
   - Unsplash: `https://images.unsplash.com/photo-...`
   - Imgur: `https://i.imgur.com/...`
3. 제목, 태그, 연도 입력
4. **💾 저장** 버튼 클릭
5. ✅ **즉시 반영!**

---

### **4️⃣ 프로젝트 수정하기**

1. 수정하고 싶은 프로젝트의 **✏️ 수정** 버튼 클릭
2. 정보 변경
3. **💾 저장** 버튼 클릭
4. ✅ **즉시 반영!**

---

### **5️⃣ 프로젝트 삭제하기**

1. 삭제하고 싶은 프로젝트의 **🗑️** 버튼 클릭
2. 확인 대화상자에서 **확인** 클릭
3. ✅ **즉시 삭제됨!**

---

## 📁 **파일 저장 위치**

### **업로드된 파일**
```
/home/user/webapp/public/uploads/
├─ 1736752800000-my-image.jpg
├─ 1736752801000-video.mp4
└─ ...
```

### **Archive 데이터**
```
/home/user/webapp/public/archive-data.json
```

---

## 🔧 **API 엔드포인트**

### **1. Archive 데이터 조회**
```http
GET /api/archive
```
**응답:**
```json
[
  {
    "id": 1,
    "type": "image",
    "url": "/uploads/1736752800000-image.jpg",
    "title": "프로젝트 이름",
    "tags": ["Research", "Visual"],
    "year": "2025"
  }
]
```

### **2. Archive 데이터 저장**
```http
POST /api/archive
Content-Type: application/json

[
  { "id": 1, "type": "image", ... }
]
```

### **3. 파일 업로드**
```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary data]
```
**응답:**
```json
{
  "success": true,
  "url": "/uploads/1736752800000-image.jpg",
  "filename": "1736752800000-image.jpg",
  "originalName": "my-image.jpg",
  "size": 1024000,
  "mimetype": "image/jpeg"
}
```

### **4. 파일 삭제**
```http
DELETE /api/upload/:filename
```

### **5. 서버 상태 확인**
```http
GET /api/health
```

---

## 🎨 **지원 파일 형식**

### **이미지**
- ✅ JPEG (`.jpg`, `.jpeg`)
- ✅ PNG (`.png`)
- ✅ GIF (`.gif`)
- ✅ WebP (`.webp`)

### **비디오**
- ✅ MP4 (`.mp4`)
- ✅ WebM (`.webm`)
- ✅ QuickTime (`.mov`)

### **파일 크기 제한**
- 최대 **50MB**

---

## 💡 **주요 변경점**

### **이전 방식** ❌
1. 관리자 페이지에서 수정
2. JSON 파일 다운로드
3. `public/archive-data.json`에 수동 업로드
4. Git commit & push
5. 배포

### **현재 방식** ✅
1. 관리자 페이지에서 수정
2. **💾 저장** 버튼 클릭
3. ✨ **끝! 즉시 반영됨!**

---

## 🐛 **문제 해결**

### **Q: 업로드한 이미지가 안 보여요**
**A:** 브라우저 캐시 문제일 수 있습니다.
```
Ctrl + Shift + R (강력 새로고침)
```

### **Q: 서버가 안 켜져요**
**A:** 포트가 이미 사용 중일 수 있습니다.
```bash
# 포트 사용 확인
lsof -i :3001
lsof -i :3005

# 프로세스 종료
kill -9 <PID>
```

### **Q: 파일 업로드가 실패해요**
**A:** 파일 형식과 크기를 확인하세요.
- 지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, MOV
- 최대 크기: 50MB

---

## 🔐 **보안 참고사항**

⚠️ **주의:** 현재는 개발 환경입니다. 프로덕션 배포 시 다음을 추가하세요:

1. **인증 토큰**: JWT 또는 세션 기반 인증
2. **파일 검증**: 파일 내용 스캔 (악성코드, 바이러스)
3. **CORS 제한**: 특정 도메인만 허용
4. **Rate Limiting**: API 호출 제한
5. **HTTPS**: SSL/TLS 암호화

---

## 📊 **서버 로그 확인**

### **백엔드 로그**
```bash
# 터미널에서 실시간 확인
# 서버 실행 중인 터미널을 보면 됩니다
```

**로그 예시:**
```
✅ File uploaded: /uploads/1736752800000-image.jpg
✅ Archive data saved successfully
🗑️ File deleted: 1736752800000-old-image.jpg
```

---

## 🚀 **다음 단계**

프로덕션 배포를 위해서는:

1. **데이터베이스 추가** (MongoDB, PostgreSQL 등)
2. **클라우드 스토리지** (AWS S3, Cloudinary 등)
3. **CDN 설정** (CloudFlare, AWS CloudFront)
4. **환경 변수 관리** (`.env` 파일)
5. **Docker 컨테이너화**

---

## 📞 **추가 도움이 필요하신가요?**

문제가 있거나 새로운 기능이 필요하시면 언제든지 말씀해주세요! 😊
