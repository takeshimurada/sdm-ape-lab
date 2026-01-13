# 🚀 배포 가이드

## 📦 Cloudflare Pages 배포 방법

### ✅ 현재 상태
- **자동 배포**: GitHub에 push하면 Cloudflare Pages가 자동으로 배포
- **배포 URL**: https://88a85538.sdm-ape-lab.pages.dev

---

## 🔧 백엔드 API 설정

### **Cloudflare Functions 사용** (권장)

이미 `functions/api/archive.js` 파일이 생성되어 있습니다!

#### 작동 방식
```
브라우저 → /api/archive → Cloudflare Functions → JSON 반환
```

#### 배포 시 자동 작동
- ✅ `/api/archive` GET 요청 → `archive-data.json` 반환
- ⚠️ POST 요청은 현재 기본 응답만 반환

---

## 💾 관리자 기능 활성화 (선택사항)

### 옵션 1: Cloudflare KV 사용

1. **Cloudflare Dashboard 접속**
   - Workers & Pages → KV

2. **KV Namespace 생성**
   - 이름: `ARCHIVE_DATA`

3. **Functions에 바인딩**
   
   **wrangler.toml 생성:**
   ```toml
   name = "sdm-ape-lab"
   compatibility_date = "2024-01-01"
   
   [[kv_namespaces]]
   binding = "ARCHIVE_DATA"
   id = "YOUR_KV_NAMESPACE_ID"
   ```

4. **functions/api/archive.js 수정:**
   ```javascript
   export async function onRequestGet(context) {
     // KV에서 데이터 읽기
     const data = await context.env.ARCHIVE_DATA.get('archive', { type: 'json' });
     
     return new Response(JSON.stringify(data || []), {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
       },
     });
   }
   
   export async function onRequestPost(context) {
     const data = await context.request.json();
     
     // KV에 데이터 저장
     await context.env.ARCHIVE_DATA.put('archive', JSON.stringify(data));
     
     return new Response(JSON.stringify({ success: true }), {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
       },
     });
   }
   ```

---

### 옵션 2: Cloudflare D1 (SQLite) 사용

1. **D1 데이터베이스 생성**
   ```bash
   wrangler d1 create archive-db
   ```

2. **테이블 생성**
   ```sql
   CREATE TABLE archive (
     id INTEGER PRIMARY KEY,
     type TEXT,
     url TEXT,
     title TEXT,
     tags TEXT,
     year TEXT,
     description TEXT
   );
   ```

3. **Functions에서 사용**
   ```javascript
   export async function onRequestGet(context) {
     const { results } = await context.env.DB.prepare(
       'SELECT * FROM archive'
     ).all();
     
     return new Response(JSON.stringify(results), {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*',
       },
     });
   }
   ```

---

## 📤 파일 업로드 설정

### Cloudflare R2 (S3 호환) 사용

1. **R2 버킷 생성**
   - Cloudflare Dashboard → R2
   - 버킷 이름: `sdm-ape-lab-uploads`

2. **Functions에서 파일 업로드**
   ```javascript
   // functions/api/upload.js
   export async function onRequestPost(context) {
     const formData = await context.request.formData();
     const file = formData.get('file');
     
     if (!file) {
       return new Response('No file', { status: 400 });
     }
     
     const filename = `${Date.now()}-${file.name}`;
     
     // R2에 업로드
     await context.env.UPLOADS.put(filename, file.stream());
     
     return new Response(JSON.stringify({
       url: `/uploads/${filename}`,
       originalName: file.name
     }), {
       headers: { 'Content-Type': 'application/json' },
     });
   }
   ```

---

## 🎯 배포 체크리스트

### 기본 배포 (현재 상태)
- ✅ GitHub push → 자동 배포
- ✅ Archive 탭 읽기 전용 작동
- ✅ 정적 JSON 파일 사용
- ❌ 관리자 추가/수정/삭제 불가능

### 완전한 배포 (KV/D1 사용)
- ✅ GitHub push → 자동 배포
- ✅ Archive 탭 작동
- ✅ 관리자 페이지 작동
- ✅ 파일 업로드 작동 (R2 사용)
- ✅ 실시간 수정 가능

---

## 🔄 현재 환경별 작동

| 기능 | Sandbox | Cloudflare (현재) | Cloudflare (KV 추가 후) |
|------|---------|------------------|----------------------|
| Archive 보기 | ✅ | ✅ | ✅ |
| 관리자 추가/수정 | ✅ | ❌ | ✅ |
| 파일 업로드 | ✅ | ❌ | ✅ |
| 백엔드 | Node.js | Functions (읽기만) | Functions (읽기/쓰기) |

---

## 🎨 고릴라 크기 조정

### 반응형 스케일 적용 완료!

```javascript
// CustomModelLoader.tsx
const MODEL_CONFIG = {
  TARGET_SCALE: 2.5,        // 데스크톱
  TARGET_SCALE_MOBILE: 2.0, // 모바일
};

// 화면 크기 감지
const isMobile = viewport.width < 768;
const baseScale = isMobile ? 
  MODEL_CONFIG.TARGET_SCALE_MOBILE : 
  MODEL_CONFIG.TARGET_SCALE;
```

### 수동 조정 (필요시)

`components/CustomModelLoader.tsx` 파일:
```javascript
const MODEL_CONFIG = {
  TARGET_SCALE: 3.0,        // 더 크게 (기본: 2.5)
  TARGET_SCALE_MOBILE: 2.5, // 모바일도 크게 (기본: 2.0)
};
```

---

## 📝 배포 명령어

### Cloudflare Pages (자동)
```bash
git add .
git commit -m "update"
git push origin main
```

### 로컬 테스트
```bash
# 백엔드
node server.js

# 프론트엔드
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

---

## 🌐 접속 URL

### 개발 (Sandbox)
**https://3002-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai**
- 백엔드 있음
- 관리자 기능 사용 가능

### 프로덕션 (Cloudflare)
**https://88a85538.sdm-ape-lab.pages.dev**
- 정적 배포
- Archive 읽기 전용
- 관리자 기능은 KV 추가 후 사용 가능

---

## 🚨 중요 사항

1. **정적 JSON 수정 방법 (현재)**
   - `public/archive-data.json` 파일 직접 수정
   - Git push → 자동 배포

2. **KV/D1 사용 시**
   - 관리자 페이지에서 직접 수정 가능
   - 실시간 반영

3. **파일 업로드**
   - Sandbox에서만 작동
   - Cloudflare에서 사용하려면 R2 설정 필요

---

## 🎉 완료!

- ✅ 코드가 GitHub에 푸시되었습니다
- ✅ Cloudflare Pages가 자동으로 배포합니다
- ✅ 고릴라 크기가 화면에 맞게 조정됩니다

**테스트 URL:**
- Sandbox: https://3002-ipofpr2kp5racpe2roqg8-5634da27.sandbox.novita.ai
- Production: https://88a85538.sdm-ape-lab.pages.dev

문제가 있으면 알려주세요! 😊
