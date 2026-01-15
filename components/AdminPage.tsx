import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Archive item type - 블로그 스타일
interface ArchiveItem {
  id: number;
  type: 'image' | 'video' | 'youtube' | 'text' | 'website';
  url: string;
  media?: Array<{
    type: 'image' | 'video' | 'youtube';
    url: string;
  }>;
  title: string;
  tags: string[];
  year: string;
  description?: string;
  content?: string;
}

// YouTube URL에서 비디오 ID 추출
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
};

const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  return videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : url;
};

// 백엔드 URL 헬퍼 함수
// 방명록은 항상 Cloudflare Pages KV 사용 (하나의 DB)
const getBackendUrl = () => {
  // 로컬에서도 Cloudflare Pages API 사용 (KV 동기화)
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // 로컬에서도 Cloudflare Pages API 사용
    return 'https://88a85538.sdm-ape-lab.pages.dev';
  }
  
  // Cloudflare Pages에서는 상대 경로 사용
  return '';
};

// Archive용 백엔드 URL (로컬 개발 지원)
const getArchiveBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSandbox = hostname.includes('sandbox.novita.ai');
  const isCloudflare = hostname.includes('pages.dev');
  
  if (isLocalhost) {
    return 'http://localhost:3001';
  } else if (isSandbox) {
    return window.location.origin.replace(/\d{4}-/, '3001-');
  } else if (isCloudflare) {
    return '';
  } else {
    return '';
  }
};

// Guestbook 엔트리 타입
interface GuestBookEntry {
  id: number;
  name: string;
  message: string;
  date: string;
  time?: string;
}

const AdminPage: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'archive' | 'guestbook'>('archive');
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Guestbook 관련 상태
  const [guestbookEntries, setGuestbookEntries] = useState<GuestBookEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<GuestBookEntry | null>(null);

  // 📖 데이터 로드 (API에서)
  useEffect(() => {
    loadData();
    loadGuestbookData();
  }, []);

  const loadData = async () => {
    try {
      // Archive도 항상 Cloudflare Pages KV 사용 (로컬과 Cloudflare 동기화)
      const backendUrl = getBackendUrl(); // Cloudflare Pages URL
      const apiUrl = backendUrl ? `${backendUrl}/api/archive` : '/api/archive';
      
      const res = await fetch(apiUrl, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setMessage('❌ 데이터 로드 실패');
    }
  };

  // 📖 방명록 데이터 로드 (항상 Cloudflare Pages KV 사용)
  const loadGuestbookData = async () => {
    try {
      const backendUrl = getBackendUrl(); // Cloudflare Pages URL
      const apiUrl = `${backendUrl}/api/guestbook`;
      
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setGuestbookEntries(data);
    } catch (err) {
      console.error('Failed to load guestbook data:', err);
    }
  };

  // ✏️ 방명록 엔트리 수정 (항상 Cloudflare Pages KV 사용)
  const handleGuestbookUpdate = async (entry: GuestBookEntry) => {
    try {
      const backendUrl = getBackendUrl(); // Cloudflare Pages URL
      const apiUrl = `${backendUrl}/api/guestbook/${entry.id}`;
      
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: entry.name,
          message: entry.message
        })
      });
      
      if (res.ok) {
        await loadGuestbookData();
        setEditingEntry(null);
        // 항상 Cloudflare Pages KV에 저장됨
        setMessage('✅ 방명록이 수정되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('수정 실패');
      }
    } catch (err) {
      console.error('Failed to update guestbook:', err);
      setMessage('❌ 수정 중 오류가 발생했습니다.');
    }
  };

  // 🗑️ 방명록 엔트리 삭제 (항상 Cloudflare Pages KV 사용)
  const handleGuestbookDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const backendUrl = getBackendUrl(); // Cloudflare Pages URL
      const apiUrl = `${backendUrl}/api/guestbook/${id}`;
      
      const res = await fetch(apiUrl, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await loadGuestbookData();
        // 항상 Cloudflare Pages KV에 저장됨
        setMessage('🗑️ 방명록이 삭제되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('삭제 실패');
      }
    } catch (err) {
      console.error('Failed to delete guestbook:', err);
      setMessage('❌ 삭제 중 오류가 발생했습니다.');
    }
  };

  // 📥 CSV 다운로드
  const handleDownloadCSV = () => {
    if (guestbookEntries.length === 0) {
      setMessage('다운로드할 방명록이 없습니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // CSV 헤더
    const headers = ['ID', '이름', '메시지', '날짜', '시간'];
    
    // CSV 데이터 변환
    const csvRows = [
      headers.join(','),
      ...guestbookEntries.map(entry => {
        // CSV 형식에 맞게 따옴표 처리 및 쉼표/줄바꿈 제거
        const escapeCSV = (str: string) => {
          if (!str) return '';
          // 쉼표, 줄바꿈, 따옴표가 있으면 따옴표로 감싸고 내부 따옴표는 두 개로
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        return [
          entry.id,
          escapeCSV(entry.name),
          escapeCSV(entry.message),
          escapeCSV(entry.date),
          escapeCSV(entry.time || '')
        ].join(',');
      })
    ];
    
    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\n');
    
    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명: guestbook_YYYYMMDD_HHMMSS.csv
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    link.download = `guestbook_${timestamp}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setMessage('✅ CSV 파일이 다운로드되었습니다.');
    setTimeout(() => setMessage(''), 3000);
  };

  // 💾 데이터 저장 (API로) - Cloudflare Pages KV 사용
  const saveData = async (data: ArchiveItem[]) => {
    setSaving(true);
    try {
      // Archive도 Cloudflare Pages KV 사용 (로컬과 Cloudflare 동기화)
      const backendUrl = getBackendUrl(); // Cloudflare Pages URL
      const apiUrl = backendUrl ? `${backendUrl}/api/archive` : '/api/archive';
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        // 항상 Cloudflare Pages KV에 저장됨
        setMessage('✅ 저장 완료! 바로 반영되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await res.json().catch(() => ({ error: '저장 실패' }));
        if (errorData.error && errorData.error.includes('KV가 설정되지 않았습니다')) {
          setMessage(`⚠️ ${errorData.error}\n\n${errorData.message || ''}\n\nCloudflare Dashboard에서 ARCHIVE_KV를 설정해주세요.`);
          setTimeout(() => setMessage(''), 10000);
        } else {
          throw new Error('저장 실패');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('❌ 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 📤 파일 업로드 (이미지/비디오) - 여러 파일 지원
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingItem) return;

    // 로컬에서는 로컬 서버, Cloudflare Pages에서는 Functions API 사용
    const backendUrl = getArchiveBackendUrl();
    const apiUrl = backendUrl ? `${backendUrl}/api/upload` : '/api/upload';

    setUploading(true);
    setMessage(`📤 ${files.length}개 파일 업로드 중...`);

    try {
      const uploadedUrls: string[] = [];
      const mediaArray: Array<{ type: 'image' | 'video'; url: string }> = [];

      // 여러 파일 순차 업로드
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading ${i + 1}/${files.length}:`, file.name);

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const result = await res.json();
          console.log('✅ Upload result:', result);
          
          let fileUrl = result.url;
          if (!backendUrl && result.url.startsWith('/uploads/')) {
            fileUrl = result.url;
          }
          
          uploadedUrls.push(fileUrl);
          
          // 미디어 타입 결정
          const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
          mediaArray.push({ type: mediaType, url: fileUrl });
        } else {
          const errorData = await res.json().catch(() => ({ error: '업로드 실패' }));
          console.error(`❌ Upload failed for ${file.name}:`, errorData);
          throw new Error(`${file.name} 업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
        }
      }

      // 첫 번째 파일을 메인 URL로, 나머지는 media 배열에
      const mainUrl = uploadedUrls[0];
      const additionalMedia = uploadedUrls.slice(1).map((url, idx) => mediaArray[idx + 1]);

      setEditingItem({ 
        ...editingItem, 
        url: mainUrl,
        media: [...(editingItem.media || []), ...additionalMedia]
      });
      
      setMessage(`✅ ${files.length}개 파일 업로드 완료!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ 업로드 중 오류가 발생했습니다: ' + (err as Error).message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 다시 선택 가능하도록)
      e.target.value = '';
    }
  };

  // 새 프로젝트 추가
  const handleAdd = () => {
    const newItem: ArchiveItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      type: 'text', // 기본값을 text로
      url: '',
      media: [], // 빈 미디어 배열
      title: '새 프로젝트',
      tags: [],
      year: new Date().getFullYear().toString(),
      description: '',
      content: ''
    };
    setEditingItem(newItem);
    setIsAdding(true);
  };

  // 프로젝트 저장
  const handleSave = async () => {
    if (!editingItem) return;

    let updatedItems;
    if (isAdding) {
      updatedItems = [...items, editingItem];
    } else {
      updatedItems = items.map(item => 
        item.id === editingItem.id ? editingItem : item
      );
    }

    setItems(updatedItems);
    await saveData(updatedItems);
    
    setEditingItem(null);
    setIsAdding(false);
  };

  // 프로젝트 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await saveData(updatedItems);
    
    setMessage('🗑️ 삭제 완료!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-4 sm:px-6 md:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
              >
                관리자 페이지
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                프로젝트를 추가/수정/삭제하면 <strong className="text-pink-400">즉시 반영</strong>됩니다!
              </p>
            </div>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg transition-colors text-sm touch-manipulation"
            >
              ← 돌아가기
            </button>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-gray-800/50 border border-pink-500/30 rounded-lg text-white"
                style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-6 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation ${
                activeTab === 'archive'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-white/50 hover:text-white/80 active:text-white'
              }`}
              style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
            >
              📁 Archive
            </button>
            <button
              onClick={() => setActiveTab('guestbook')}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation ${
                activeTab === 'guestbook'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-white/50 hover:text-white/80 active:text-white'
              }`}
              style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
            >
              📖 방명록
            </button>
          </div>

          {/* Add Button - Archive 탭에서만 표시 */}
          {activeTab === 'archive' && (
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto px-6 py-4 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white rounded-lg font-semibold transition-colors mb-6 touch-manipulation"
              style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
            >
              + 새 프로젝트 추가
            </button>
          )}
        </div>

        {/* Archive Tab */}
        {activeTab === 'archive' && (
        <div className="max-w-6xl mx-auto">
          {/* Projects List - Text-based like Jon Rafman */}
          <div className="space-y-1">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-900 active:bg-gray-800 transition-colors gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 w-full overflow-hidden">
                  <span className="text-gray-500 text-xs sm:text-sm font-mono flex-shrink-0">
                    [{String(item.id).padStart(3, '0')}]
                  </span>
                  <span className="text-white/60 flex-shrink-0">
                    {item.type === 'youtube' ? '𓆛' : item.type === 'video' ? '𓁹' : '𓉔'}
                  </span>
                  <span 
                    className="text-white text-sm sm:text-base truncate flex-1"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(item.title) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {item.title}
                  </span>
                  <span className="text-gray-600 text-xs sm:text-sm font-mono flex-shrink-0">
                    {item.year}
                  </span>
                </div>

                {/* Actions - Always visible on mobile */}
                <div className="flex gap-2 w-full sm:w-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAdding(false);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm rounded transition-colors touch-manipulation"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm rounded transition-colors touch-manipulation"
                  >
                    삭제
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        )}

        {/* Guestbook Tab */}
        {activeTab === 'guestbook' && (
        <div className="max-w-6xl mx-auto">
          {/* CSV 다운로드 버튼 */}
          <div className="mb-4 flex justify-start sm:justify-end">
            <button
              onClick={handleDownloadCSV}
              className="w-full sm:w-auto px-4 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs sm:text-sm rounded transition-colors flex items-center justify-center gap-2 touch-manipulation"
              style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
            >
              📥 CSV 다운로드
            </button>
          </div>
          
          <div className="space-y-4">
            {guestbookEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-gray-900 active:bg-gray-800 transition-colors"
              >
                {editingEntry?.id === entry.id ? (
                  // 수정 모드
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">이름</label>
                      <input
                        type="text"
                        value={editingEntry.name}
                        onChange={(e) => setEditingEntry({ ...editingEntry, name: e.target.value })}
                        className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-2">메시지</label>
                      <textarea
                        value={editingEntry.message}
                        onChange={(e) => setEditingEntry({ ...editingEntry, message: e.target.value })}
                        className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500 resize-none"
                        rows={4}
                        maxLength={500}
                      />
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <button
                        onClick={() => handleGuestbookUpdate(editingEntry)}
                        className="flex-1 sm:flex-none px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm rounded transition-colors touch-manipulation"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingEntry(null)}
                        className="flex-1 sm:flex-none px-4 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-sm rounded transition-colors touch-manipulation"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 표시 모드
                  <div>
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2">
                          <span className="text-white font-medium text-sm">{entry.name}</span>
                          <span className="text-white/30 text-xs">
                            {entry.date} {entry.time && entry.time}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {entry.message}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs rounded transition-colors touch-manipulation"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleGuestbookDelete(entry.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs rounded transition-colors touch-manipulation"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {guestbookEntries.length === 0 && (
              <p className="text-center text-white/30 text-sm py-12">
                방명록이 비어있습니다.
              </p>
            )}
          </div>
        </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setEditingItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
              >
                <h2 
                  className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6"
                  style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                >
                  {isAdding ? '새 프로젝트 추가' : '프로젝트 수정'}
                </h2>

                {/* Type Selection */}
                <div className="mb-4">
                  <label 
                    className="block text-gray-400 text-xs sm:text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    타입
                  </label>
                  <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer text-sm touch-manipulation">
                      <input
                        type="radio"
                        checked={editingItem.type === 'image'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'image' })}
                        className="w-4 h-4"
                      />
                      🖼️ 이미지
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer text-sm touch-manipulation">
                      <input
                        type="radio"
                        checked={editingItem.type === 'video'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'video' })}
                        className="w-4 h-4"
                      />
                      🎬 비디오
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer text-sm touch-manipulation">
                      <input
                        type="radio"
                        checked={editingItem.type === 'youtube'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'youtube' })}
                        className="w-4 h-4"
                      />
                      📺 YouTube
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer text-sm touch-manipulation">
                      <input
                        type="radio"
                        checked={editingItem.type === 'website'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'website' })}
                        className="w-4 h-4"
                      />
                      🌐 웹사이트
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer text-sm touch-manipulation col-span-2 sm:col-span-1">
                      <input
                        type="radio"
                        checked={editingItem.type === 'text'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'text' })}
                        className="w-4 h-4"
                      />
                      📝 텍스트
                    </label>
                  </div>
                </div>

                {/* File Upload - Only for image/video (not text) */}
                {editingItem.type !== 'youtube' && editingItem.type !== 'website' && editingItem.type !== 'text' && (
                  <div className="mb-4">
                    <label 
                      className="block text-gray-400 text-sm mb-2"
                      style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                    >
                      파일 업로드 (여러 개 선택 가능)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept={editingItem.type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-pink-500 file:text-white
                        hover:file:bg-pink-600
                        file:cursor-pointer cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploading && (
                      <p 
                        className="text-sm text-pink-400 mt-2"
                        style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                      >
                        ⏳ 업로드 중...
                      </p>
                    )}
                    {editingItem.media && editingItem.media.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                        업로드된 파일: {editingItem.media.length + 1}개
                        (첫 번째 파일이 메인, 나머지는 추가 미디어)
                      </div>
                    )}
                  </div>
                )}

                {/* URL - 텍스트 타입이 아닐 때만 표시 */}
                {editingItem.type !== 'text' && (
                  <div className="mb-4">
                    <label 
                      className="block text-gray-400 text-sm mb-2"
                      style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                    >
                      {editingItem.type === 'youtube' 
                        ? 'YouTube URL (필수)' 
                        : editingItem.type === 'website'
                        ? '웹사이트 URL (필수)'
                        : 'URL 입력'}
                    </label>
                    <input
                      type="text"
                      value={editingItem.url}
                      onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                      placeholder={
                        editingItem.type === 'youtube' 
                          ? 'https://www.youtube.com/watch?v=...' 
                          : editingItem.type === 'website'
                          ? 'https://earth.google.com/web/'
                          : '/uploads/파일명.png 또는 https://example.com/image.jpg'
                      }
                      className="w-full px-3 sm:px-4 py-3 bg-gray-800 text-white text-sm rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                    />
                    {editingItem.type === 'youtube' && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 YouTube URL 예시: https://www.youtube.com/watch?v=VIDEO_ID
                      </p>
                    )}
                    {editingItem.type === 'website' && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 클릭 시 새 탭에서 열립니다.
                      </p>
                    )}
                    {editingItem.type !== 'youtube' && editingItem.type !== 'website' && editingItem.type !== 'text' && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 파일을 업로드하거나 외부 URL을 입력하세요. R2가 설정되어 있으면 바로 업로드 가능합니다.
                      </p>
                    )}
                  </div>
                )}

                {/* URL Preview */}
                {editingItem.url && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <p 
                      className="text-xs text-gray-400 mb-1"
                      style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                    >
                      미리보기 URL:
                    </p>
                    <p className="text-xs text-green-400 break-all">{editingItem.url}</p>
                  </div>
                )}

                {/* Validation Warning - 텍스트 타입이 아닐 때만 */}
                {editingItem.type !== 'text' && !editingItem.url && (
                  <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                    <p 
                      className="text-sm text-yellow-400"
                      style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                    >
                      ⚠️ 파일을 업로드하거나 URL을 입력해주세요.
                    </p>
                  </div>
                )}

                {/* Title */}
                <div className="mb-4">
                  <label 
                    className="block text-gray-400 text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    제목
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-800 text-white text-sm rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(editingItem.title) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label 
                    className="block text-gray-400 text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    설명 (선택)
                  </label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="프로젝트에 대한 상세 설명을 입력하세요..."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-3 bg-gray-800 text-white text-sm rounded-lg border border-gray-700 focus:border-pink-500 outline-none resize-none"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(editingItem.description || '') 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  />
                </div>

                {/* Year */}
                <div className="mb-6">
                  <label 
                    className="block text-gray-400 text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    연도
                  </label>
                  <input
                    type="text"
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="2025"
                    className="w-full px-3 sm:px-4 py-3 bg-gray-800 text-white text-sm rounded-lg border border-gray-700 focus:border-pink-500 outline-none font-mono"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || (!editingItem.url && editingItem.type !== 'text') || !editingItem.title}
                    className="flex-1 px-6 py-4 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors touch-manipulation text-sm"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    {saving ? '⏳ 저장 중...' : (!editingItem.url && editingItem.type !== 'text') ? '⚠️ URL 필요' : !editingItem.title ? '⚠️ 제목 필요' : '💾 저장'}
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-4 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white rounded-lg transition-colors touch-manipulation text-sm"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    취소
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPage;
