// Archive 데이터를 KV로 마이그레이션하는 스크립트
// 사용법: node scripts/migrate-archive-to-kv.js

import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ARCHIVE_DATA_PATH = join(__dirname, '..', 'public', 'archive-data.json');

async function migrateToKV() {
  try {
    // archive-data.json 읽기
    const data = await fs.readFile(ARCHIVE_DATA_PATH, 'utf-8');
    const archiveData = JSON.parse(data);
    
    console.log('📦 Archive 데이터:', archiveData.length, '개 항목');
    console.log('\n📋 데이터 내용:');
    archiveData.forEach((item, index) => {
      console.log(`  ${index + 1}. [${item.id}] ${item.title} (${item.type})`);
    });
    
    console.log('\n✅ 마이그레이션 방법:');
    console.log('1. Cloudflare Pages 관리자 페이지 접속');
    console.log('2. 새 프로젝트 추가하지 말고, 기존 데이터를 KV에 수동으로 복사');
    console.log('3. 또는 아래 JSON을 Cloudflare Dashboard → Workers & Pages → KV → 편집에서 직접 입력');
    console.log('\n📄 JSON 데이터:');
    console.log(JSON.stringify(archiveData, null, 2));
    
    console.log('\n💡 또는 관리자 페이지에서:');
    console.log('1. 로컬에서 npm run dev:full 실행');
    console.log('2. 관리자 페이지 접속');
    console.log('3. 기존 프로젝트들을 하나씩 다시 추가 (빠른 방법)');
    
  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

migrateToKV();
