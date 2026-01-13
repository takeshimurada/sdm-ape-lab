import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// CORS 설정 - 개발 환경에서 모든 origin 허용
app.use(cors());
app.use(express.json());

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = join(__dirname, 'public', 'uploads');
    
    // uploads 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 한글 파일명 지원 + 타임스탬프로 유니크하게
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const safeName = `${timestamp}-${originalName}`;
    cb(null, safeName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지, 비디오, 일부 문서 파일 허용
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  }
});

// Archive 데이터 파일 경로
const ARCHIVE_DATA_PATH = join(__dirname, 'public', 'archive-data.json');

// 📖 Archive 데이터 읽기
app.get('/api/archive', async (req, res) => {
  try {
    const data = await fs.readFile(ARCHIVE_DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    // 파일이 없으면 빈 배열 반환
    console.log('Archive data not found, returning empty array');
    res.json([]);
  }
});

// 💾 Archive 데이터 저장 (전체)
app.post('/api/archive', async (req, res) => {
  try {
    const data = req.body;
    
    // 데이터 검증
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: '배열 형식의 데이터가 필요합니다.' });
    }
    
    // JSON 파일로 저장
    await fs.writeFile(
      ARCHIVE_DATA_PATH,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    console.log('✅ Archive data saved successfully');
    res.json({ success: true, message: '저장되었습니다.' });
  } catch (error) {
    console.error('❌ Save error:', error);
    res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
  }
});

// 📤 파일 업로드 (이미지/비디오)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }
    
    // 업로드된 파일의 공개 URL 반환
    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ File uploaded:', fileUrl);
    res.json({ 
      success: true, 
      url: fileUrl,
      filename: req.file.filename,
      originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: '업로드 중 오류가 발생했습니다.' });
  }
});

// 🗑️ 파일 삭제
app.delete('/api/upload/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = join(__dirname, 'public', 'uploads', filename);
    
    // 파일 존재 확인
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }
    
    // 파일 삭제
    await fs.unlink(filePath);
    
    console.log('✅ File deleted:', filename);
    res.json({ success: true, message: '파일이 삭제되었습니다.' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
});

// 📊 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uploadsDir: join(__dirname, 'public', 'uploads')
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║  🚀 SDM APE LAB - Admin Backend Server          ║
║  📡 Running on: http://localhost:${PORT}         ║
║  📁 Archive API: /api/archive                    ║
║  📤 Upload API: /api/upload                      ║
║  🗑️  Delete API: /api/upload/:filename           ║
╚══════════════════════════════════════════════════╝
  `);
});
