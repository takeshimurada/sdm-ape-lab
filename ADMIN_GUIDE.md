# 🎨 Archive 관리자 페이지 사용 가이드

## 🚀 빠른 시작

### 1️⃣ 관리자 페이지 접속
웹사이트 어디서나 **`Ctrl + Shift + A`** (Mac: `Cmd + Shift + A`)를 누르면 관리자 페이지로 이동합니다.

### 2️⃣ 프로젝트 추가
1. **"+ 새 프로젝트 추가"** 버튼 클릭
2. 프로젝트 정보 입력:
   - **제목**: 프로젝트 이름
   - **타입**: 이미지 🖼️ 또는 비디오 🎥 선택
   - **URL**: 이미지/비디오 주소 입력
   - **태그**: 쉼표로 구분 (예: 연구, 실험, 비주얼)
   - **연도**: 2024, 2025 등
3. **"💾 저장"** 버튼 클릭
4. **archive-data.json** 파일이 자동으로 다운로드됨

### 3️⃣ JSON 파일 적용
다운로드된 `archive-data.json` 파일을 프로젝트에 복사:

```bash
# 다운로드 폴더에서 프로젝트로 복사
cp ~/Downloads/archive-data.json /home/user/webapp/public/archive-data.json

# Git 커밋
cd /home/user/webapp
git add public/archive-data.json
git commit -m "update: archive projects"
git push origin main
```

---

## 📸 이미지 업로드 방법

### 방법 1: 파일 직접 업로드 ⭐ (추천)
1. 관리자 페이지에서 **"📁 파일 선택"** 클릭
2. 컴퓨터에서 이미지 선택
3. 자동으로 Base64 형식으로 변환되어 저장됨
4. ✅ **장점**: 즉시 미리보기 가능, 외부 서버 불필요
5. ⚠️ **단점**: 파일 크기가 커지면 JSON 파일이 커짐 (2MB 이하 권장)

### 방법 2: 로컬 파일 경로 사용
1. 이미지를 `public/images/` 폴더에 저장:
   ```bash
   cp my-image.jpg /home/user/webapp/public/images/
   ```
2. URL 입력란에 `/images/my-image.jpg` 입력
3. ✅ **장점**: JSON 파일이 가볍다
4. ⚠️ **단점**: 파일을 별도로 관리해야 함

### 방법 3: 외부 URL 사용
1. 이미지 호스팅 서비스 사용 (Imgur, Cloudinary 등)
2. 이미지 URL 복사
3. URL 입력란에 붙여넣기
4. ✅ **장점**: CDN 속도, 무제한 용량
5. ⚠️ **단점**: 외부 서비스 의존

---

## 🎬 비디오 추가하기

### 권장 방법
1. **YouTube/Vimeo 등에 업로드** (추천)
2. **Cloudinary 같은 비디오 호스팅 사용**
3. **작은 비디오는 로컬 저장**:
   ```bash
   # public/videos/ 폴더에 저장
   cp my-video.mp4 /home/user/webapp/public/videos/
   ```
   - URL에 `/videos/my-video.mp4` 입력

### 비디오 사양
- **포맷**: MP4 (H.264 코덱)
- **크기**: 10MB 이하 권장
- **해상도**: 1080p 이하
- **길이**: 10초 이하 권장 (루프 재생됨)

---

## ✏️ 프로젝트 수정

1. 프로젝트 카드의 **"✏️ 수정"** 버튼 클릭
2. 정보 수정
3. **"💾 저장"** 버튼 클릭
4. 다운로드된 JSON 파일을 `public/archive-data.json`에 복사

---

## 🗑️ 프로젝트 삭제

1. 프로젝트 카드의 **"🗑️ 삭제"** 버튼 클릭
2. 확인 다이얼로그에서 **"확인"** 클릭
3. 다운로드된 JSON 파일을 `public/archive-data.json`에 복사

---

## 🔐 보안

### 관리자 페이지 접근 제한
현재는 **`Ctrl + Shift + A`** 단축키로만 접근 가능합니다.

### 프로덕션 환경에서 보안 강화 (선택사항)
```typescript
// App.tsx에 비밀번호 추가
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    const password = prompt('관리자 비밀번호를 입력하세요:');
    if (password === 'your-secret-password') {
      setCurrentView('ADMIN');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  }
};
```

---

## 🌟 실전 예시

### 서대문 유인원 연구회 프로젝트 추가

#### 1단계: 이미지 준비
```bash
# 프로젝트 이미지를 public/images/에 저장
cp ~/Desktop/gorilla-study-01.jpg /home/user/webapp/public/images/
```

#### 2단계: 관리자 페이지에서 추가
- **제목**: 고릴라 형태 연구 01
- **타입**: 이미지 🖼️
- **URL**: `/images/gorilla-study-01.jpg`
- **태그**: 형태학, 관찰, 3D스캔
- **연도**: 2025

#### 3단계: JSON 적용
```bash
cp ~/Downloads/archive-data.json /home/user/webapp/public/
cd /home/user/webapp
git add public/archive-data.json
git commit -m "feat: add gorilla morphology study project"
git push origin main
```

---

## 📊 데이터 구조

### JSON 파일 형식
```json
[
  {
    "id": 1,
    "type": "image",
    "url": "/images/project.jpg",
    "title": "프로젝트 제목",
    "tags": ["태그1", "태그2"],
    "year": "2025"
  }
]
```

### 필드 설명
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | number | 고유 번호 (자동 생성) | 1, 2, 3... |
| `type` | string | 'image' 또는 'video' | "image" |
| `url` | string | 파일 경로 또는 URL | "/images/test.jpg" |
| `title` | string | 프로젝트 제목 | "연구 프로젝트 01" |
| `tags` | array | 태그 배열 | ["연구", "실험"] |
| `year` | string | 연도 | "2025" |

---

## 🚨 문제 해결

### Q: JSON 파일을 저장했는데 변경사항이 안 보여요
**A**: 브라우저 캐시 문제입니다.
1. **Ctrl + Shift + R** (강력 새로고침)
2. 또는 브라우저 개발자 도구(F12) → Network 탭 → "Disable cache" 체크

### Q: 이미지가 안 보여요
**A**: 다음을 확인하세요:
1. 파일 경로가 정확한지 (`/images/파일명.jpg`)
2. 파일이 `public/images/` 폴더에 있는지
3. 파일명 대소문자 확인 (Linux는 대소문자 구분)

### Q: Base64로 저장한 이미지가 너무 커요
**A**: 이미지를 압축하세요:
- [TinyPNG](https://tinypng.com/) - 무손실 압축
- [Squoosh](https://squoosh.app/) - 고급 압축
- 권장: 500KB 이하로 압축

### Q: 비디오가 재생 안 돼요
**A**: 비디오 포맷을 확인하세요:
1. MP4 (H.264) 사용
2. 10MB 이하로 압축
3. 외부 호스팅 사용 (YouTube, Vimeo)

---

## 💡 Pro Tips

### 1. 이미지 최적화
```bash
# ImageMagick으로 일괄 리사이즈
mogrify -resize 1600x -quality 85 *.jpg
```

### 2. Git으로 JSON 백업
```bash
# 변경사항 자동 추적
cd /home/user/webapp
git log public/archive-data.json
```

### 3. 빠른 복사 스크립트
```bash
# ~/quick-update.sh
#!/bin/bash
cp ~/Downloads/archive-data.json /home/user/webapp/public/
cd /home/user/webapp
git add public/archive-data.json
git commit -m "update: archive data"
git push origin main
echo "✅ 업데이트 완료!"
```

---

## 🎯 다음 단계

### 선택사항: 자동 배포 설정
GitHub Actions로 자동 배포:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    paths:
      - 'public/archive-data.json'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      # 배포 스크립트 추가
```

### 선택사항: 실시간 DB 연동
- Firebase Firestore
- Supabase
- MongoDB Atlas

---

## 📞 도움말

- **GitHub**: https://github.com/takeshimurada/sdm-ape-lab
- **Instagram**: [@sdm.ape.lab](https://instagram.com/sdm.ape.lab)
- **Email**: kitschkitschyayajjajja@gmail.com

---

**Version**: 2.0.0  
**Updated**: 2026-01-12  
**Author**: SDM APE LAB
