// Cloudflare Pages Functions
// /api/upload 엔드포인트

// POST: 파일 업로드
export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: '파일이 없습니다.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: '파일 크기는 50MB를 초과할 수 없습니다.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 파일 형식 검증
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    
    if (!allowedMimes.includes(file.type)) {
      return new Response(JSON.stringify({ error: '지원하지 않는 파일 형식입니다.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Cloudflare Pages는 정적 호스팅이므로 파일 저장 불가
    // 로컬 개발 환경에서만 파일 업로드 가능
    return new Response(JSON.stringify({ 
      error: 'Cloudflare Pages에서는 파일 업로드가 불가능합니다.',
      message: '로컬 개발 환경(localhost)에서만 파일 업로드가 가능합니다. 로컬에서 파일을 업로드한 후 Git에 커밋하고 배포하세요.',
      instruction: '1. 로컬에서 npm run dev:full 실행\n2. 관리자 페이지에서 파일 업로드\n3. Git에 커밋: git add public/uploads/\n4. 배포: git push origin main'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
    return new Response(JSON.stringify({
      success: true,
      url: fileUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      mimetype: file.type
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: '업로드 중 오류가 발생했습니다.',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
