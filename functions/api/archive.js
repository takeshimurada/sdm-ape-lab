// Cloudflare Pages Functions
// /api/archive 엔드포인트

import archiveData from '../../public/archive-data.json';

export async function onRequestGet(context) {
  return new Response(JSON.stringify(archiveData), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    // Cloudflare KV 또는 D1 데이터베이스에 저장
    // 현재는 간단하게 응답만 반환
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
