# 📦 Archive 데이터 교체 가이드

## 🎯 목적
Archive 페이지에 **실제 프로젝트 데이터**를 추가하는 방법을 안내합니다.

---

## 📝 방법 1: 코드에서 직접 수정

### 1️⃣ 파일 열기
```bash
code components/ArchiveGrid.tsx
```

### 2️⃣ `ARCHIVE_ITEMS` 배열 찾기 (약 23번째 줄)
```typescript
const ARCHIVE_ITEMS: ArchiveItem[] = [
  // 여기에 프로젝트 추가
];
```

### 3️⃣ 데이터 형식
```typescript
{
  id: 1,                    // 고유 번호 (순차적으로 증가)
  type: 'image',            // 'image' 또는 'video'
  url: '이미지/비디오 URL', // 실제 파일 URL
  title: '프로젝트 제목',    // 한글/영어 가능
  tags: ['태그1', '태그2'], // 쉼표로 구분된 태그들
  year: '2025'              // 연도 (문자열)
}
```

---

## 🖼️ 이미지/비디오 URL 얻는 방법

### 옵션 1: 로컬 파일 사용 (권장)
```typescript
{
  id: 1,
  type: 'image',
  url: '/images/project-01.jpg',  // public/images/ 폴더에 저장
  title: '프로젝트 01',
  tags: ['연구', '실험'],
  year: '2025'
}
```

**파일 위치:**
```
/home/user/webapp/public/images/project-01.jpg
```

### 옵션 2: 외부 URL 사용
```typescript
{
  id: 2,
  type: 'image',
  url: 'https://your-domain.com/image.jpg',
  title: '프로젝트 02',
  tags: ['디자인'],
  year: '2025'
}
```

### 옵션 3: Unsplash (무료 고품질 이미지)
```typescript
{
  id: 3,
  type: 'image',
  url: 'https://images.unsplash.com/photo-1234567890?auto=format&fit=crop&q=80&w=1600',
  title: '프로젝트 03',
  tags: ['비주얼'],
  year: '2024'
}
```

---

## 📹 비디오 추가하기

### MP4 파일 사용
```typescript
{
  id: 4,
  type: 'video',
  url: '/videos/demo.mp4',  // public/videos/ 폴더
  title: '모션 프로젝트',
  tags: ['모션', '애니메이션'],
  year: '2024'
}
```

---

## 🎨 실제 예시

### 서대문 유인원 연구회 프로젝트
```typescript
const ARCHIVE_ITEMS: ArchiveItem[] = [
  { 
    id: 1, 
    type: 'image', 
    url: '/images/morphology-study-01.jpg',
    title: '형태학적 연구 시리즈 01',
    tags: ['형태학', '관찰', '3D스캔'],
    year: '2025'
  },
  { 
    id: 2, 
    type: 'video', 
    url: '/videos/neural-visualization.mp4',
    title: '신경망 시각화 프로젝트',
    tags: ['AI', '비주얼', '인터랙티브'],
    year: '2025'
  },
  { 
    id: 3, 
    type: 'image', 
    url: '/images/gaze-tracking.jpg',
    title: '시선 추적 실험',
    tags: ['관찰', '기술', '연구'],
    year: '2024'
  },
  { 
    id: 4, 
    type: 'image', 
    url: '/images/color-psychology.jpg',
    title: '색채 심리학 연구',
    tags: ['색채', '심리', '실험'],
    year: '2024'
  },
];
```

---

## 📁 파일 구조 (로컬 파일 사용 시)

```
/home/user/webapp/
├── public/
│   ├── images/
│   │   ├── project-01.jpg
│   │   ├── project-02.jpg
│   │   └── project-03.png
│   └── videos/
│       ├── demo-01.mp4
│       └── demo-02.mp4
├── components/
│   └── ArchiveGrid.tsx  ← 여기서 수정
```

---

## 🚀 빠른 시작 (3단계)

### 1단계: 이미지 추가
```bash
# public 폴더에 images 디렉토리 생성
mkdir -p /home/user/webapp/public/images

# 이미지 파일 복사 (예시)
cp ~/my-project.jpg /home/user/webapp/public/images/
```

### 2단계: 코드 수정
```typescript
// components/ArchiveGrid.tsx 열기
const ARCHIVE_ITEMS: ArchiveItem[] = [
  { 
    id: 1, 
    type: 'image', 
    url: '/images/my-project.jpg',  // ← 파일명 수정
    title: '내 프로젝트',
    tags: ['디자인', '연구'],
    year: '2025'
  },
];
```

### 3단계: 적용
```bash
cd /home/user/webapp
git add .
git commit -m "feat: add real project data to Archive"
git push origin main
```

---

## 🎯 권장 이미지 사양

| 항목 | 권장값 |
|------|--------|
| **비율** | 3:4 (세로) 또는 4:3 (가로) |
| **해상도** | 1600px 이상 (너비) |
| **포맷** | JPG, PNG, WebP |
| **용량** | 500KB ~ 2MB |
| **품질** | 고품질 (압축 최소화) |

---

## 💡 팁

### 1. 이미지 최적화
- [TinyPNG](https://tinypng.com/) - 무손실 압축
- [ImageOptim](https://imageoptim.com/) - Mac용 압축

### 2. 무료 이미지 소스
- [Unsplash](https://unsplash.com/) - 고품질 무료 사진
- [Pexels](https://www.pexels.com/) - 무료 스톡 사진
- [Pixabay](https://pixabay.com/) - 무료 이미지/비디오

### 3. 많은 프로젝트 추가하기
```typescript
// 10개 이상도 가능
const ARCHIVE_ITEMS: ArchiveItem[] = [
  { id: 1, ... },
  { id: 2, ... },
  { id: 3, ... },
  // ... 계속 추가
  { id: 20, ... },
];
```

---

## ❓ 문제 해결

### 이미지가 안 보여요
1. URL이 정확한지 확인
2. 파일이 `public/` 폴더 안에 있는지 확인
3. 파일명 대소문자 확인 (Linux는 대소문자 구분)

### 비디오가 재생 안 돼요
1. MP4 포맷 사용 (권장)
2. 파일 크기 확인 (10MB 이하 권장)
3. 코덱 확인 (H.264 권장)

---

## 📞 도움이 필요하면

GitHub Issue: https://github.com/takeshimurada/sdm-ape-lab/issues
Instagram: [@sdm.ape.lab](https://instagram.com/sdm.ape.lab)
Email: kitschkitschyayajjajja@gmail.com

---

**Version**: 1.1.0  
**Updated**: 2026-01-12
