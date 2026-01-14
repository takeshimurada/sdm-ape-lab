# 🕐 Version 1.0.0 복원 가이드

## 📌 현재 저장된 버전

- **Git Tag**: `v1.0.0`
- **Branch**: `version-1.0`
- **Commit**: `3f8a40e`

---

## 🎯 상황별 복원 방법

### 1️⃣ 잠깐 확인만 하고 싶을 때 (가장 간단)

```bash
cd /home/user/webapp
git checkout v1.0.0
# 확인 후
git checkout main
```

---

### 2️⃣ 버전 1 기반으로 새로운 작업을 하고 싶을 때 (추천)

```bash
cd /home/user/webapp
git checkout -b my-new-feature v1.0.0
# 작업 진행
git add .
git commit -m "새 기능 추가"
# main으로 돌아가기
git checkout main
```

---

### 3️⃣ main을 완전히 버전 1로 되돌리고 싶을 때 (주의!)

```bash
cd /home/user/webapp

# 안전을 위해 현재 상태 백업
git branch backup-before-reset

# v1.0.0으로 되돌리기
git reset --hard v1.0.0

# GitHub에 반영 (주의: 강제 푸시)
git push origin main --force
```

---

## 📋 빠른 명령어 참조

| 하고 싶은 것 | 명령어 |
|------------|--------|
| 버전 확인 | `git tag -l` |
| 브랜치 확인 | `git branch -a` |
| v1.0.0으로 이동 | `git checkout v1.0.0` |
| version-1.0 브랜치로 이동 | `git checkout version-1.0` |
| main으로 돌아가기 | `git checkout main` |
| 현재 위치 확인 | `git branch` |

---

## ⚠️ 주의사항

1. **detached HEAD 경고**가 나오면:
   - 단순 확인만 하는 것이므로 괜찮습니다
   - 작업하려면 새 브랜치를 만드세요

2. **--force 푸시는 위험합니다**:
   - 다른 사람이 작업 중이면 충돌 발생
   - 백업 브랜치를 먼저 만드세요

3. **안전한 방법**:
   - 항상 새 브랜치를 만들어서 작업
   - main은 건드리지 않기

---

## 🆘 문제 해결

### "detached HEAD" 상태에서 벗어나기
```bash
git checkout main
```

### 실수로 수정한 경우
```bash
git checkout main
# 모든 변경사항 버리기
git reset --hard origin/main
```

### 브랜치 목록 확인
```bash
git branch -a
```

---

## 📞 도움말

버전 1.0.0 내용:
- 3D 고릴라 모델 + 마우스 회전
- 하트 커서 + 핑크 글로우
- 10개 언어 랜덤 번역
- 아스팔트 질감 ????? 버튼
- Archive 그리드
- 다크 테마

GitHub: https://github.com/takeshimurada/sdm-ape-lab
