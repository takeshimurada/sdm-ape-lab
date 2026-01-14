# 🚀 홈페이지 프리뷰 가이드

## 📋 방법 1: 전체 스택 실행 (권장)

백엔드와 프론트엔드를 동시에 실행합니다.

### Windows PowerShell에서 실행:

```powershell
# 1. 프로젝트 디렉토리로 이동 (이미 있다면 생략)
cd C:\Users\4146\Desktop\sdm-ape-lab\sdm-ape-lab

# 2. 전체 스택 실행 (백엔드 + 프론트엔드)
npm run dev:full
```

### 또는 수동으로 두 개의 터미널에서:

**터미널 1 - 백엔드 서버:**
```powershell
npm run server
```

**터미널 2 - 프론트엔드 서버:**
```powershell
npm run dev
```

### 접속 URL:
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:3001

---

## 📋 방법 2: 프론트엔드만 실행

백엔드 기능(파일 업로드, Archive 관리 등) 없이 UI만 확인하고 싶을 때:

```powershell
npm run dev
```

### 접속 URL:
- **프론트엔드**: http://localhost:5173

⚠️ **주의**: 이 방법으로는 관리자 페이지의 파일 업로드 기능이 작동하지 않습니다.

---

## 📋 방법 3: 빌드된 버전 프리뷰

프로덕션 빌드를 미리 확인하고 싶을 때:

```powershell
# 1. 빌드
npm run build

# 2. 프리뷰
npm run preview
```

### 접속 URL:
- **프리뷰**: http://localhost:4173 (또는 Vite가 알려주는 포트)

---

## 🎯 빠른 시작 (한 줄 명령어)

```powershell
npm run dev:full
```

그 다음 브라우저에서 **http://localhost:5173** 접속!

---

## 🔧 문제 해결

### 포트가 이미 사용 중일 때

**에러**: `Port 3000 is already in use`

**해결 방법 1**: 다른 포트 사용
```powershell
# Vite 설정에서 포트 변경하거나
# 환경 변수로 포트 지정
$env:PORT=3002; npm run dev
```

**해결 방법 2**: 사용 중인 프로세스 종료
```powershell
# 포트 3000 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# PID 확인 후 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID [PID번호] /F
```

### 백엔드 서버가 시작되지 않을 때

```powershell
# 의존성 설치 확인
npm install

# 백엔드만 따로 실행해서 에러 확인
npm run server
```

### 브라우저에서 접속이 안 될 때

1. **방화벽 확인**: Windows 방화벽이 포트를 막고 있는지 확인
2. **localhost 대신 127.0.0.1 사용**: http://127.0.0.1:3000
3. **다른 브라우저 시도**: Chrome, Edge, Firefox 등

---

## 📌 주요 기능 테스트

프리뷰가 실행되면 다음 기능들을 테스트할 수 있습니다:

### 1. 메인 페이지
- 3D 고릴라 모델 확인
- 마우스 회전 기능
- 하트 커서 효과

### 2. ABOUT 페이지
- ????? 버튼 클릭하여 언어 변경
- 랜덤 번역 확인

### 3. ARCHIVE 페이지
- 프로젝트 목록 확인
- 프로젝트 클릭하여 상세 페이지 확인

### 4. GUESTBOOK 페이지
- 방명록 작성 및 확인

### 5. 관리자 페이지
- `Ctrl+Shift+A` 또는 `Ctrl+Shift+E`로 접속
- 비밀번호: `sdmapelab2025`
- 파일 업로드 및 Archive 관리

---

## 🎨 개발 모드 특징

- **핫 리로드**: 파일 저장 시 자동 새로고침
- **에러 표시**: 브라우저 콘솔에서 에러 확인 가능
- **빠른 반영**: 코드 변경이 즉시 반영됨

---

## 📞 추가 도움

문제가 계속되면:
1. `npm install` 실행하여 의존성 재설치
2. `node_modules` 폴더 삭제 후 `npm install` 재실행
3. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

---

**작성일**: 2026-01-13  
**버전**: 현재 버전
