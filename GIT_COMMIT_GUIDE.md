# 📝 Git 커밋 가이드

## 로컬에서 프로젝트 업로드 후 Git 커밋하기

### 1단계: 변경된 파일 확인
```bash
git status
```

### 2단계: 변경된 파일 추가
```bash
# 모든 변경사항 추가
git add .

# 또는 특정 파일만 추가
git add public/archive-data.json
git add public/uploads/
```

### 3단계: 커밋
```bash
git commit -m "프로젝트 추가: [프로젝트 이름]"
```

예시:
```bash
git commit -m "프로젝트 추가: 유인원 행동 패턴 분석"
```

### 4단계: GitHub에 푸시
```bash
git push origin main
```

### 5단계: Cloudflare Pages 자동 배포
- GitHub에 푸시하면 자동으로 배포됩니다 (1-2분 소요)

---

## 빠른 명령어 (한 번에)
```bash
git add .
git commit -m "프로젝트 업데이트"
git push origin main
```

---

## 주의사항
- `public/uploads/` 폴더의 파일들도 함께 커밋해야 합니다
- `public/archive-data.json` 파일이 업데이트되었는지 확인하세요
- 커밋 메시지는 간단명료하게 작성하세요
