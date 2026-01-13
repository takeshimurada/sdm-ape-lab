# 🔧 관리자 페이지 문제 해결 가이드

## ❌ 문제: "저장 버튼이 안 눌려요"

### 🔍 **원인**

저장 버튼은 다음 조건들이 모두 충족되어야 활성화됩니다:

```tsx
disabled={saving || !editingItem.url || !editingItem.title}
```

즉:
1. ❌ **URL이 없으면** → 버튼 비활성화
2. ❌ **제목이 없으면** → 버튼 비활성화  
3. ❌ **저장 중이면** → 버튼 비활성화

---

## ✅ **해결 방법**

### **1️⃣ 파일 업로드 확인**

#### **A. 파일 선택 후 URL 확인**

1. **파일 업로드** 버튼 클릭
2. 이미지/비디오 선택
3. **"✅ 업로드 완료: 파일명"** 메시지 확인
4. **미리보기 URL** 섹션에 URL이 표시되는지 확인

```
미리보기 URL:
/uploads/1736752800000-your-image.jpg
```

#### **B. 업로드가 실패했다면**

브라우저 개발자 도구 (F12)를 열고:

1. **Console** 탭에서 에러 확인
2. **Network** 탭에서 `/api/upload` 요청 상태 확인
   - Status: `200` → 성공
   - Status: `4xx` or `5xx` → 실패

**자주 발생하는 에러:**
- `Failed to fetch`: 백엔드 서버가 실행되지 않음
- `413 Payload Too Large`: 파일 크기가 50MB 초과
- `415 Unsupported Media Type`: 지원하지 않는 파일 형식

---

### **2️⃣ 외부 URL 사용**

파일 업로드가 안 되면 외부 URL을 사용하세요:

#### **A. Unsplash 이미지**
```
https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600
```

#### **B. Imgur 이미지**
```
https://i.imgur.com/your-image.jpg
```

#### **C. 유튜브 비디오 (embed)**
```
https://www.youtube.com/embed/VIDEO_ID
```

---

### **3️⃣ 제목 입력 확인**

저장 버튼 텍스트를 확인하세요:

| 버튼 텍스트 | 의미 | 해결 방법 |
|------------|------|----------|
| `⚠️ URL 필요` | URL이 없음 | 파일 업로드 또는 URL 입력 |
| `⚠️ 제목 필요` | 제목이 없음 | 제목 입력 |
| `💾 저장` | 저장 가능 | 클릭 가능! |
| `⏳ 저장 중...` | 저장 진행 중 | 잠시 대기 |

---

### **4️⃣ 백엔드 서버 확인**

파일 업로드가 계속 실패하면 백엔드 서버를 확인하세요:

#### **터미널에서 확인**

```bash
# 백엔드 서버 실행 확인
lsof -i :3001

# 출력 예시 (정상):
# node    1123 user   25u  IPv4  26290      0t0  TCP *:3001 (LISTEN)
```

#### **백엔드 재시작**

```bash
cd /home/user/webapp

# 기존 프로세스 종료
pkill -f "node server.js"

# 백엔드 재시작
node server.js &

# 프론트엔드 재시작
npm run dev
```

---

### **5️⃣ 브라우저 캐시 초기화**

오래된 캐시가 문제를 일으킬 수 있습니다:

```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

또는:

1. F12 (개발자 도구)
2. Network 탭
3. "Disable cache" 체크

---

## 🐛 **디버깅 팁**

### **1. 콘솔 로그 확인**

브라우저 개발자 도구 (F12) → Console 탭:

```
✅ 정상적인 로그:
📤 Starting upload: my-image.jpg
📡 Upload response status: 200
✅ Upload result: {success: true, url: '/uploads/...'}
```

```
❌ 에러 로그:
Upload error: Failed to fetch
❌ Upload failed: 413 Payload Too Large
```

### **2. Network 요청 확인**

F12 → Network 탭 → `/api/upload`:

| Status | 의미 | 해결 방법 |
|--------|------|----------|
| `200` | 성공 | 정상 |
| `400` | 잘못된 요청 | 파일이 선택되지 않았거나 손상됨 |
| `413` | 파일 너무 큼 | 50MB 이하로 압축 |
| `415` | 지원 안 함 | 지원 파일 형식 확인 |
| `500` | 서버 오류 | 백엔드 로그 확인 |
| `Failed` | 연결 실패 | 백엔드 서버 실행 확인 |

### **3. 서버 로그 확인**

백엔드 서버를 실행한 터미널에서 로그 확인:

```
✅ 정상:
✅ File uploaded: /uploads/1736752800000-image.jpg

❌ 에러:
❌ Upload error: ENOENT: no such file or directory
```

---

## 📋 **체크리스트**

저장이 안 될 때 다음을 확인하세요:

- [ ] **백엔드 서버** 실행 중인가? (`lsof -i :3001`)
- [ ] **프론트엔드 서버** 실행 중인가? (브라우저에서 접속 가능한가?)
- [ ] **파일 업로드** 완료되었는가? ("✅ 업로드 완료" 메시지)
- [ ] **미리보기 URL** 표시되는가?
- [ ] **제목** 입력했는가?
- [ ] **저장 버튼** 활성화되었는가? (회색이 아닌 핑크색)
- [ ] **브라우저 콘솔** 에러 없는가? (F12)

---

## 🚀 **빠른 해결책**

### **방법 1: 외부 URL 사용 (권장)**

파일 업로드가 안 되면 일단 외부 URL을 사용하세요:

1. Unsplash에서 이미지 URL 복사
2. "또는 URL 직접 입력" 필드에 붙여넣기
3. 제목, 태그, 연도 입력
4. **💾 저장** 클릭

### **방법 2: 서버 완전 재시작**

```bash
cd /home/user/webapp

# 모든 서버 종료
pkill -f "node server.js"
pkill -f "vite"

# 백엔드 시작
node server.js &

# 프론트엔드 시작
npm run dev

# 또는 한 번에:
./start-dev.sh
```

### **방법 3: 파일 크기 줄이기**

이미지가 너무 크면:
- **온라인 압축**: https://tinypng.com
- **리사이즈**: 1600px 이하로

비디오가 너무 크면:
- **온라인 압축**: https://www.freeconvert.com/video-compressor
- **해상도 낮추기**: 720p 또는 1080p

---

## 🔧 **고급 문제 해결**

### **uploads 디렉토리 권한 문제**

```bash
cd /home/user/webapp
mkdir -p public/uploads
chmod 755 public/uploads
```

### **포트 충돌**

백엔드가 3001 포트를 못 쓰면:

```bash
# server.js 수정
const PORT = 3002;  // 다른 포트 사용
```

그리고 `vite.config.ts`도 수정:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:3002',  // 변경된 포트
    ...
  }
}
```

---

## 📞 **여전히 안 되나요?**

다음 정보와 함께 문의하세요:

1. **브라우저 콘솔 로그** (F12 → Console 스크린샷)
2. **Network 탭 스크린샷** (F12 → Network → `/api/upload`)
3. **백엔드 서버 로그** (터미널 출력)
4. **파일 정보** (파일 크기, 형식)

이 정보가 있으면 문제를 빠르게 해결할 수 있습니다! 😊

---

## ✅ **테스트 URL**

https://3006-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai

### **개선사항:**
- ✅ **미리보기 URL 표시**: 업로드된 파일 URL 확인 가능
- ✅ **경고 메시지**: URL이 없으면 경고 표시
- ✅ **버튼 상태 피드백**: 버튼에 현재 상태 표시
- ✅ **상세 에러 로그**: 콘솔에서 정확한 에러 확인
- ✅ **제목 검증**: 제목도 필수 항목으로 추가

이제 저장 버튼이 왜 안 눌리는지 바로 알 수 있습니다! 🎉
