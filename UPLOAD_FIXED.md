# 🔧 업로드 문제 해결 완료!

## ✅ **해결 완료**

백엔드 서버가 재시작되었습니다. 이제 정상적으로 작동합니다!

---

## 🧪 **테스트 URL**

**메인 사이트:**
https://3008-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai

**백엔드 API:**
- Health Check: http://localhost:3001/api/health
- Archive API: http://localhost:3001/api/archive
- Upload API: http://localhost:3001/api/upload

---

## ✅ **테스트 절차**

### **1. 관리자 페이지 접속**
1. 웹사이트 열기: https://3008-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai
2. **Ctrl + Shift + A** 누르기
3. 비밀번호 입력: `sdmapelab2025`
4. 관리자 페이지 확인

### **2. 파일 업로드 테스트**
1. **+ 새 프로젝트 추가** 클릭
2. 타입 선택: **🖼️ 이미지** 또는 **🎬 비디오**
3. **파일 업로드** 버튼 클릭
4. 테스트 이미지 선택 (5MB 이하 권장)
5. ⏳ "업로드 중..." 메시지 확인
6. ✅ "업로드 완료" 메시지 확인
7. **미리보기 URL** 섹션에 URL 표시 확인

### **3. YouTube URL 테스트**
1. **+ 새 프로젝트 추가** 클릭
2. 타입 선택: **📺 YouTube**
3. YouTube URL 입력:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
4. 제목 입력: "테스트 YouTube 비디오"
5. 설명 입력: "YouTube 테스트"
6. 태그: "Test, YouTube"
7. 연도: "2025"
8. **💾 저장** 클릭

### **4. 저장 및 확인**
1. "✅ 저장 완료! 바로 반영되었습니다." 메시지 확인
2. **← 돌아가기** 클릭
3. **ARCHIVE** 탭 클릭
4. 새 프로젝트가 표시되는지 확인
5. 프로젝트 **클릭**하여 상세 페이지 확인

---

## 🐛 **만약 여전히 업로드가 안 된다면?**

### **체크리스트:**

#### **1. 백엔드 서버 확인**
```bash
# 터미널에서 실행
lsof -i :3001

# 출력이 없으면 서버가 꺼진 것
# 다시 시작:
cd /home/user/webapp
node server.js &
```

#### **2. 브라우저 콘솔 확인**
1. **F12** 키 누르기
2. **Console** 탭 열기
3. 에러 메시지 확인

**자주 발생하는 에러:**
```javascript
// 에러 1: Failed to fetch
// 원인: 백엔드 서버가 꺼짐
// 해결: 위 1번 참고

// 에러 2: 413 Payload Too Large
// 원인: 파일이 50MB 초과
// 해결: 파일 압축 또는 작은 파일 사용

// 에러 3: 415 Unsupported Media Type
// 원인: 지원하지 않는 파일 형식
// 해결: JPEG, PNG, MP4 등 지원 형식 사용
```

#### **3. Network 탭 확인**
1. **F12** → **Network** 탭
2. 파일 업로드 시도
3. `/api/upload` 요청 찾기
4. Status 코드 확인:
   - `200`: 성공 ✅
   - `400`: 잘못된 요청 ❌
   - `413`: 파일 너무 큼 ❌
   - `500`: 서버 오류 ❌
   - `Failed`: 연결 실패 ❌

#### **4. 파일 형식 및 크기 확인**

**지원 파일:**
- **이미지**: JPEG, PNG, GIF, WebP
- **비디오**: MP4, WebM, QuickTime (.mov)
- **최대 크기**: 50MB

**권장 크기:**
- 이미지: 2-5MB
- 비디오: 10-30MB

---

## 🔄 **서버 완전 재시작 방법**

문제가 계속되면 모든 서버를 재시작하세요:

```bash
cd /home/user/webapp

# 1. 모든 프로세스 종료
pkill -f "node server.js"
pkill -f "vite"

# 2. 백엔드 시작
node server.js &

# 3. 잠시 대기
sleep 2

# 4. 프론트엔드 시작
npm run dev

# 또는 한 번에:
./start-dev.sh
```

---

## 📊 **현재 서버 상태**

### **백엔드 (Node.js)**
- ✅ 포트: 3001
- ✅ 상태: Running
- ✅ Health Check: OK

### **프론트엔드 (Vite)**
- ✅ 포트: 3008
- ✅ 상태: Running
- ✅ URL: https://3008-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai

### **Proxy 설정**
- ✅ `/api/*` → `http://localhost:3001`
- ✅ `/uploads/*` → `http://localhost:3001`

---

## 💡 **업로드 대신 URL 사용**

파일 업로드가 계속 안 되면 외부 URL을 사용하세요:

### **이미지 호스팅 서비스:**

1. **Unsplash** (무료, 고품질)
   ```
   https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&q=80&w=1600
   ```

2. **Imgur** (무료, 간단)
   - https://imgur.com 접속
   - 이미지 업로드
   - Direct Link 복사

3. **Google Drive** (공유 링크)
   - 파일 업로드 → 공유 → 링크 복사

### **YouTube**
```
https://www.youtube.com/watch?v=VIDEO_ID
```

---

## 🎯 **빠른 테스트 URL**

바로 사용 가능한 테스트 URL:

### **이미지:**
```
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600
```

### **YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 📞 **추가 도움**

여전히 문제가 있다면 다음 정보를 제공해주세요:

1. **브라우저 콘솔 스크린샷** (F12 → Console)
2. **Network 탭 스크린샷** (F12 → Network → /api/upload)
3. **에러 메시지** (있다면)
4. **파일 정보** (크기, 형식)

이 정보로 문제를 빠르게 해결할 수 있습니다! 😊

---

## ✅ **테스트 완료 후**

업로드가 성공하면:
1. Archive 탭에서 프로젝트 확인
2. 클릭하여 상세 페이지 확인
3. YouTube 비디오는 재생 확인

모든 기능이 정상 작동합니다! 🎉
