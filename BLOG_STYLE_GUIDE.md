# 📝 블로그 스타일 Archive 가이드

## ✅ 완성된 기능

### 1️⃣ **여러 미디어 지원**
- 이미지 여러 개
- 비디오 여러 개  
- YouTube 비디오 여러 개
- 혼합 가능 (이미지 + 비디오 + YouTube)

### 2️⃣ **텍스트 전용 게시물**
- 미디어 없이 글만 작성 가능
- 블로그 포스트처럼 사용

### 3️⃣ **블로그 형태 상세 페이지**
- 제목
- 미디어 갤러리
- 본문 (description)
- 추가 콘텐츠 (content)
- 태그, 연도

---

## 📊 데이터 구조

### 기본 구조
```json
{
  "id": 1,
  "type": "text",
  "url": "",
  "media": [
    {
      "type": "image",
      "url": "https://example.com/image1.jpg"
    },
    {
      "type": "image", 
      "url": "https://example.com/image2.jpg"
    },
    {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID"
    }
  ],
  "title": "프로젝트 제목",
  "tags": ["Research", "Visual"],
  "year": "2025",
  "description": "짧은 설명 또는 본문...",
  "content": "추가 콘텐츠 (선택사항)..."
}
```

---

## 🎯 사용 예시

### 예시 1: 이미지 여러 개 + 글
```json
{
  "id": 1,
  "type": "image",
  "url": "https://example.com/main.jpg",
  "media": [
    {"type": "image", "url": "https://example.com/img1.jpg"},
    {"type": "image", "url": "https://example.com/img2.jpg"},
    {"type": "image", "url": "https://example.com/img3.jpg"}
  ],
  "title": "시각 연구 프로젝트",
  "description": "3개의 이미지로 구성된 시각 연구 작업입니다.\n\n각 이미지는 서로 다른 관점을 보여줍니다...",
  "year": "2025"
}
```

### 예시 2: YouTube + 설명
```json
{
  "id": 2,
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "media": [
    {"type": "youtube", "url": "https://www.youtube.com/watch?v=VIDEO_ID1"},
    {"type": "youtube", "url": "https://www.youtube.com/watch?v=VIDEO_ID2"}
  ],
  "title": "비디오 아카이브",
  "description": "2개의 YouTube 비디오로 구성된 작업입니다.",
  "year": "2025"
}
```

### 예시 3: 텍스트 전용
```json
{
  "id": 3,
  "type": "text",
  "url": "",
  "media": [],
  "title": "연구 노트",
  "description": "미디어 없이 텍스트만 작성한 게시물입니다.\n\n긴 글을 작성할 수 있습니다...",
  "content": "추가적인 내용이나 긴 본문...",
  "year": "2025"
}
```

### 예시 4: 혼합 (이미지 + 비디오 + YouTube)
```json
{
  "id": 4,
  "type": "image",
  "url": "",
  "media": [
    {"type": "image", "url": "https://example.com/cover.jpg"},
    {"type": "video", "url": "/uploads/video.mp4"},
    {"type": "youtube", "url": "https://www.youtube.com/watch?v=VIDEO_ID"},
    {"type": "image", "url": "https://example.com/conclusion.jpg"}
  ],
  "title": "멀티미디어 프로젝트",
  "description": "이미지, 비디오, YouTube를 모두 사용한 종합 프로젝트입니다.",
  "year": "2025"
}
```

---

## 🛠️ 현재 상태

### ✅ 완료
- 블로그 스타일 상세 페이지
- 여러 미디어 렌더링
- 텍스트 전용 게시물 지원
- 반응형 디자인
- ESC 키로 닫기
- 돋움 폰트 자동 적용

### 🚧 수동 편집 필요
현재 `public/archive-data.json` 파일을 **직접 수정**해야 합니다.

**파일 위치:**
```
/home/user/webapp/public/archive-data.json
```

**편집 방법:**
1. 파일 열기
2. JSON 구조에 맞게 데이터 추가
3. Git commit & push
4. 자동 배포

---

## 🎨 UI 특징

### 상세 페이지
- **헤더**: 제목 + 연도 + 태그
- **미디어 갤러리**: 여러 이미지/비디오 순서대로 표시
- **본문**: description (짧은 설명)
- **추가 콘텐츠**: content (긴 글)
- **Footer**: 돌아가기 버튼

### 스타일
- 다크 배경 (`bg-black/95`)
- 돋움 폰트 (한글 자동 감지)
- 최대 너비 `max-w-3xl`
- 미디어 반응형 크기 조정
- 부드러운 페이드 애니메이션

---

## 📝 다음 단계 (선택사항)

### 옵션 1: 관리자 페이지 개선
미디어 추가/제거 UI를 만들어서 여러 미디어를 쉽게 관리할 수 있게 합니다.

### 옵션 2: 마크다운 지원
`description`과 `content`에서 마크다운을 지원해서 더 풍부한 텍스트 편집이 가능하게 합니다.

### 옵션 3: 드래그 앤 드롭
미디어 순서를 드래그로 변경할 수 있게 합니다.

---

## 🧪 테스트

**URL**: https://3002-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai

1. **Ctrl+Shift+R** 강력 새로고침
2. **ARCHIVE 탭** 클릭
3. **아무 프로젝트나 클릭**
4. 블로그 스타일 상세 페이지 확인!

---

## 🎉 완성!

이제 블로그 형태의 Archive가 완성되었습니다!
- ✅ 여러 미디어 지원
- ✅ 텍스트 전용 게시물
- ✅ 깔끔한 읽기 경험
- ✅ 반응형 디자인

문제가 있거나 추가 기능이 필요하면 알려주세요! 😊
