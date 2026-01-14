// Cloudflare Pages Functions
// /api/guestbook 엔드포인트

// GET: 방명록 목록 조회
export async function onRequestGet(context) {
  try {
    // 정적 JSON 파일을 fetch로 읽기
    const url = new URL(context.request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const jsonUrl = `${baseUrl}/guestbook-data.json`;
    
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      // 파일이 없으면 빈 배열 반환
      return new Response(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const entries = await response.json();
    
    // 최신순으로 정렬
    const sortedEntries = (entries || []).sort((a, b) => b.id - a.id);
    
    return new Response(JSON.stringify(sortedEntries), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // 에러 발생 시 빈 배열 반환
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// POST: 방명록 엔트리 추가
// 주의: Cloudflare Pages는 정적 파일이므로 실제 저장은 불가능
// KV나 D1을 사용해야 실제 저장 가능
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
    
    // 새 엔트리 생성
    const newEntry = {
      id: Date.now(), // 임시 ID
      name: name.trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, '')
    };
    
    // Cloudflare Pages는 정적 파일이므로 실제 저장 불가
    // KV나 D1을 사용하지 않는 경우, 클라이언트에서만 표시
    // 실제 저장을 원하면 Cloudflare KV 또는 D1 설정 필요
    
    return new Response(JSON.stringify({ 
      success: true, 
      entry: newEntry,
      message: '방명록이 추가되었습니다. (참고: Cloudflare Pages에서는 실제 저장을 위해 KV 또는 D1이 필요합니다.)'
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
