# 🔧 Cloudflare KV 설정 가이드 (방명록 저장)

## ✅ KV 설정하면 가능한 것

- ✅ **모든 유저가 작성한 방명록이 실제로 저장됨**
- ✅ **모든 유저가 다른 사람이 작성한 방명록을 볼 수 있음**
- ✅ **실시간으로 방명록이 공유됨**
- ✅ **무료 플랜으로 충분함** (일일 100,000 읽기, 1,000 쓰기)

---

## 📋 설정 단계

### 1단계: Cloudflare Dashboard에서 KV Namespace 생성

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **Workers & Pages → KV 메뉴 이동**

3. **"Create a namespace" 클릭**
   - 이름: `GUESTBOOK_DATA` (또는 원하는 이름)
   - 생성 완료 후 **Namespace ID** 복사 (중요!)

---

### 2단계: Cloudflare Pages 프로젝트에 KV 바인딩

1. **Workers & Pages → Pages → sdm-ape-lab 프로젝트 선택**

2. **Settings 탭 → Functions 메뉴**

3. **KV Namespace Bindings 섹션에서 "Add binding" 클릭**
   - **Variable name**: `GUESTBOOK_KV` (코드에서 사용할 이름)
   - **KV namespace**: 위에서 생성한 `GUESTBOOK_DATA` 선택
   - **Save** 클릭

---

### 3단계: 코드 수정

#### `functions/api/guestbook.js` 수정

```javascript
// GET: 방명록 목록 조회
export async function onRequestGet(context) {
  try {
    // KV에서 데이터 읽기
    const kv = context.env.GUESTBOOK_KV;
    
    if (!kv) {
      // KV가 설정되지 않은 경우 정적 파일 사용 (fallback)
      const url = new URL(context.request.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      const jsonUrl = `${baseUrl}/guestbook-data.json`;
      const response = await fetch(jsonUrl);
      
      if (!response.ok) {
        return new Response(JSON.stringify([]), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      const entries = await response.json();
      const sortedEntries = (entries || []).sort((a, b) => b.id - a.id);
      
      return new Response(JSON.stringify(sortedEntries), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // KV에서 데이터 읽기
    const data = await kv.get('guestbook', { type: 'json' });
    const entries = data || [];
    
    // 최신순으로 정렬
    const sortedEntries = entries.sort((a, b) => b.id - a.id);
    
    return new Response(JSON.stringify(sortedEntries), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// POST: 방명록 엔트리 추가
export async function onRequestPost(context) {
  try {
    const { name, message } = await context.request.json();
    
    // 데이터 검증
    if (!name || !message) {
      return new Response(JSON.stringify({ error: '이름과 메시지가 필요합니다.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    if (name.length > 50 || message.length > 500) {
      return new Response(JSON.stringify({ error: '입력 제한을 초과했습니다.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const kv = context.env.GUESTBOOK_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ 
        error: 'KV가 설정되지 않았습니다. Cloudflare Dashboard에서 KV를 설정해주세요.' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 기존 데이터 읽기
    const existingData = await kv.get('guestbook', { type: 'json' });
    const entries = existingData || [];
    
    // 새 엔트리 생성
    const newEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      name: name.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, '')
    };
    
    // 배열에 추가
    entries.push(newEntry);
    
    // KV에 저장
    await kv.put('guestbook', JSON.stringify(entries));
    
    return new Response(JSON.stringify({ 
      success: true, 
      entry: newEntry
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '저장 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
```

---

## 🚨 보안 고려사항

### 1. Rate Limiting (권장)
- 같은 IP에서 너무 자주 요청하는 것을 제한
- Cloudflare의 Rate Limiting 기능 사용 가능

### 2. 스팸 방지
- 현재는 기본적인 검증만 있음
- 필요시 CAPTCHA나 추가 검증 추가 가능

### 3. 데이터 크기 제한
- 현재: 이름 50자, 메시지 500자
- KV는 키당 최대 25MB까지 저장 가능

---

## 💰 비용

### 무료 플랜 (Free Plan)
- **읽기**: 일일 100,000회
- **쓰기**: 일일 1,000회
- **저장**: 1GB

### 방명록 사용량 예상
- 일일 방문자 1,000명 가정
- 각 방문자가 10개 방명록 조회 = 10,000 읽기
- 각 방문자가 1개 작성 = 1,000 쓰기
- **무료 플랜으로 충분함!**

---

## ✅ 설정 완료 후

1. **코드 수정 후 GitHub에 푸시**
2. **Cloudflare Pages 자동 배포 대기** (1-2분)
3. **테스트**: 방명록 작성 후 실제로 저장되는지 확인

---

## 🔍 문제 해결

### KV가 작동하지 않는 경우
1. Cloudflare Dashboard에서 KV 바인딩 확인
2. Variable name이 `GUESTBOOK_KV`인지 확인
3. Functions 로그 확인 (Cloudflare Dashboard → Pages → Functions → Logs)

### 데이터가 보이지 않는 경우
1. KV에 데이터가 저장되었는지 확인 (Cloudflare Dashboard → KV → 데이터 확인)
2. GET 요청이 올바르게 작동하는지 확인

---

## 📝 참고사항

- KV는 **전역적으로 분산**되어 있어 매우 빠름
- 데이터는 **자동으로 복제**됨
- **무료 플랜으로도 충분히 사용 가능**
