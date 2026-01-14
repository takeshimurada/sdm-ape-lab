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
        error: 'R2가 설정되지 않았습니다.',
        message: 'Cloudflare Dashboard에서 R2를 설정해주세요.',
        instruction: '1. R2 버킷 생성 (sdm-ape-lab-uploads)\n2. Public Development URL 활성화\n3. Pages → Settings → Functions → R2 Bucket Bindings에 UPLOADS_R2 추가'
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
    
    // R2 Public Development URL 또는 커스텀 도메인 사용
    // 환경변수 R2_PUBLIC_BASE_URL 이 설정되어 있으면 해당 값을 기준으로 공개 URL 생성
    // 예: https://pub-xxxxxxx.r2.dev/sdm-ape-lab-uploads
    const base = context.env.R2_PUBLIC_BASE_URL;
    let fileUrl;

    if (base && typeof base === 'string' && base.length > 0) {
      // 마지막 슬래시 제거 후 파일명 인코딩하여 붙이기
      const trimmed = base.replace(/\/+$/, '');
      fileUrl = `${trimmed}/${encodeURIComponent(filename)}`;
    } else {
      // 아직 Public URL 설정 전이라면 예전처럼 상대 경로 반환
      // (로컬 백엔드나, 추후 다른 라우팅을 위해)
      fileUrl = `/uploads/${filename}`;
    }
    
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
