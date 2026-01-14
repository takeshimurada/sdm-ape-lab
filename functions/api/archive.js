// Cloudflare Pages Functions
// /api/archive 엔드포인트

// GET: Archive 데이터 읽기
export async function onRequestGet(context) {
  try {
    const kv = context.env.ARCHIVE_KV;
    
    if (!kv) {
      // KV가 설정되지 않은 경우 정적 파일 사용 (fallback)
      const url = new URL(context.request.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      const jsonUrl = `${baseUrl}/archive-data.json`;
      const response = await fetch(jsonUrl);
      
      if (!response.ok) {
        return new Response(JSON.stringify([]), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // KV에서 데이터 읽기
    const data = await kv.get('archive', { type: 'json' });
    
    return new Response(JSON.stringify(data || []), {
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

// POST: Archive 데이터 저장
export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    const kv = context.env.ARCHIVE_KV;
    
    if (!kv) {
      // KV가 없으면 정적 파일을 업데이트할 수 없으므로 에러 반환
      // 하지만 사용자에게는 로컬에서 Git 커밋하도록 안내
      return new Response(JSON.stringify({ 
        error: 'KV가 설정되지 않았습니다.',
        message: 'Cloudflare Pages에서는 KV 없이 데이터를 저장할 수 없습니다.',
        instruction: '로컬 개발 환경에서 데이터를 저장한 후 Git에 커밋하고 배포하세요:\n1. 로컬에서 npm run dev:full 실행\n2. 관리자 페이지에서 데이터 저장\n3. git add public/archive-data.json\n4. git commit -m "Update archive"\n5. git push origin main'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // KV에 저장
    await kv.put('archive', JSON.stringify(data));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
