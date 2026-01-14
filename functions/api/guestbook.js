// Cloudflare Pages Functions
// /api/guestbook 엔드포인트

// GET: 방명록 목록 조회
export async function onRequestGet(context) {
  try {
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
      // KV가 없을 때는 200 응답을 반환하되, 실제 저장은 안 됨을 알림
      const now = new Date();
      const newEntry = {
        id: Date.now(),
        name: name.trim(),
        message: message.trim(),
        date: now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.').replace(/\.$/, ''),
        time: now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      };
      
      return new Response(JSON.stringify({ 
        success: true,
        entry: newEntry,
        warning: 'KV가 설정되지 않아 실제로 저장되지 않습니다. Cloudflare Dashboard에서 KV를 설정해주세요.'
      }), {
        status: 200,
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
    const now = new Date();
    const newEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      name: name.trim(),
      message: message.trim(),
      date: now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace(/\.$/, ''),
      time: now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
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
    return new Response(JSON.stringify({ 
      error: '저장 중 오류가 발생했습니다.',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

