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
    
    const r2 = context.env.UPLOADS_R2;
    
    if (!r2) {
      return new Response(JSON.stringify({ 
        error: 'R2가 설정되지 않았습니다. Cloudflare Dashboard에서 R2를 설정해주세요.' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // R2에 업로드
    await r2.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Public Access가 설정된 경우 URL 생성
    // R2 Public URL 형식: https://<account-id>.r2.cloudflarestorage.com/<bucket-name>/<filename>
    // 또는 Custom Domain이 설정된 경우 해당 도메인 사용
    
    // 일단 상대 경로 반환 (프론트엔드에서 처리)
    const fileUrl = `/uploads/${filename}`;
    
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
