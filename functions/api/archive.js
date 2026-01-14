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
      return new Response(JSON.stringify({ 
        error: 'KV가 설정되지 않았습니다. Cloudflare Dashboard에서 ARCHIVE_KV를 설정해주세요.',
        warning: '현재는 정적 파일만 사용 가능합니다. Git으로 archive-data.json을 수정하고 배포하세요.'
      }), {
        status: 500,
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
