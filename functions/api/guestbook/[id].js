// Cloudflare Pages Functions
// /api/guestbook/:id 엔드포인트 (수정, 삭제)

// PUT: 방명록 엔트리 수정
export async function onRequestPut(context) {
  try {
    const { id } = context.params;
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
        error: 'KV가 설정되지 않았습니다.' 
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
    
    // 엔트리 찾기
    const entryIndex = entries.findIndex(e => e.id === parseInt(id));
    if (entryIndex === -1) {
      return new Response(JSON.stringify({ error: '해당 방명록 엔트리를 찾을 수 없습니다.' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 엔트리 수정
    entries[entryIndex] = {
      ...entries[entryIndex],
      name: name.trim(),
      message: message.trim(),
    };
    
    // KV에 저장
    await kv.put('guestbook', JSON.stringify(entries));
    
    return new Response(JSON.stringify({ 
      success: true, 
      entry: entries[entryIndex]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '수정 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// DELETE: 방명록 엔트리 삭제
export async function onRequestDelete(context) {
  try {
    const { id } = context.params;
    
    const kv = context.env.GUESTBOOK_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ 
        error: 'KV가 설정되지 않았습니다.' 
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
    
    // 엔트리 삭제
    const filteredEntries = entries.filter(e => e.id !== parseInt(id));
    
    if (filteredEntries.length === entries.length) {
      return new Response(JSON.stringify({ error: '해당 방명록 엔트리를 찾을 수 없습니다.' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // KV에 저장
    await kv.put('guestbook', JSON.stringify(filteredEntries));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: '방명록 엔트리가 삭제되었습니다.'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '삭제 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
