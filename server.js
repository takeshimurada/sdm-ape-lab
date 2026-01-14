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

// 정적 파일 서빙 - 업로드된 파일 접근 가능하도록
app.use('/uploads', express.static(join(__dirname, 'public', 'uploads')));

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

// Guestbook 데이터 파일 경로
const GUESTBOOK_DATA_PATH = join(__dirname, 'public', 'guestbook-data.json');

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

// 📖 Guestbook 데이터 읽기
app.get('/api/guestbook', async (req, res) => {
  try {
    const data = await fs.readFile(GUESTBOOK_DATA_PATH, 'utf-8');
    const entries = JSON.parse(data);
    // 최신순으로 정렬
    res.json(entries.sort((a, b) => b.id - a.id));
  } catch (error) {
    // 파일이 없으면 빈 배열 반환
    console.log('Guestbook data not found, returning empty array');
    res.json([]);
  }
});

// 📝 Guestbook 엔트리 추가
app.post('/api/guestbook', async (req, res) => {
  try {
    const { name, message } = req.body;
    
    // 데이터 검증
    if (!name || !message) {
      return res.status(400).json({ error: '이름과 메시지가 필요합니다.' });
    }
    
    if (name.length > 50 || message.length > 500) {
      return res.status(400).json({ error: '입력 제한을 초과했습니다.' });
    }
    
    // 기존 데이터 읽기
    let entries = [];
    try {
      const data = await fs.readFile(GUESTBOOK_DATA_PATH, 'utf-8');
      entries = JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
      console.log('Creating new guestbook data file');
    }
    
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
    
    // JSON 파일로 저장
    await fs.writeFile(
      GUESTBOOK_DATA_PATH,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );
    
    console.log('✅ Guestbook entry added:', newEntry);
    res.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error('❌ Guestbook error:', error);
    res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
  }
});

// ✏️ Guestbook 엔트리 수정
app.put('/api/guestbook/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;
    
    // 데이터 검증
    if (!name || !message) {
      return res.status(400).json({ error: '이름과 메시지가 필요합니다.' });
    }
    
    if (name.length > 50 || message.length > 500) {
      return res.status(400).json({ error: '입력 제한을 초과했습니다.' });
    }
    
    // 기존 데이터 읽기
    let entries = [];
    try {
      const data = await fs.readFile(GUESTBOOK_DATA_PATH, 'utf-8');
      entries = JSON.parse(data);
    } catch (error) {
      return res.status(404).json({ error: '방명록 데이터를 찾을 수 없습니다.' });
    }
    
    // 엔트리 찾기
    const entryIndex = entries.findIndex(e => e.id === parseInt(id));
    if (entryIndex === -1) {
      return res.status(404).json({ error: '엔트리를 찾을 수 없습니다.' });
    }
    
    // 엔트리 수정
    entries[entryIndex] = {
      ...entries[entryIndex],
      name: name.trim(),
      message: message.trim(),
    };
    
    // JSON 파일로 저장
    await fs.writeFile(
      GUESTBOOK_DATA_PATH,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );
    
    console.log('✅ Guestbook entry updated:', entries[entryIndex]);
    res.json({ success: true, entry: entries[entryIndex] });
  } catch (error) {
    console.error('❌ Guestbook update error:', error);
    res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
  }
});

// 🗑️ Guestbook 엔트리 삭제
app.delete('/api/guestbook/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 기존 데이터 읽기
    let entries = [];
    try {
      const data = await fs.readFile(GUESTBOOK_DATA_PATH, 'utf-8');
      entries = JSON.parse(data);
    } catch (error) {
      return res.status(404).json({ error: '방명록 데이터를 찾을 수 없습니다.' });
    }
    
    // 엔트리 찾기
    const entryIndex = entries.findIndex(e => e.id === parseInt(id));
    if (entryIndex === -1) {
      return res.status(404).json({ error: '엔트리를 찾을 수 없습니다.' });
    }
    
    // 엔트리 삭제
    const deletedEntry = entries.splice(entryIndex, 1)[0];
    
    // JSON 파일로 저장
    await fs.writeFile(
      GUESTBOOK_DATA_PATH,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );
    
    console.log('✅ Guestbook entry deleted:', deletedEntry);
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    console.error('❌ Guestbook delete error:', error);
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SDM APE LAB Backend Server running on http://localhost:${PORT}`);
});
