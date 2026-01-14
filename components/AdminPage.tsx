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
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSandbox = hostname.includes('sandbox.novita.ai');
  const isCloudflare = hostname.includes('pages.dev');
  
  if (isLocalhost) {
    return 'http://localhost:3001';
  } else if (isSandbox) {
    // Sandbox 환경: HTTPS 유지하면서 포트를 3001로 변경
    return window.location.origin.replace(/\d{4}-/, '3001-');
  } else if (isCloudflare) {
    // Cloudflare Pages: Functions API 사용 (상대 경로)
    return '';
  } else {
    // 기타: Functions API 사용
    return '';
  }
};

// Guestbook 엔트리 타입
interface GuestBookEntry {
  id: number;
  name: string;
  message: string;
  date: string;
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
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/archive` : '/api/archive';
      
      const res = await fetch(apiUrl);
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

  // 📖 방명록 데이터 로드
  const loadGuestbookData = async () => {
    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/guestbook` : '/api/guestbook';
      
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

  // ✏️ 방명록 엔트리 수정
  const handleGuestbookUpdate = async (entry: GuestBookEntry) => {
    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/guestbook/${entry.id}` : `/api/guestbook/${entry.id}`;
      
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

  // 🗑️ 방명록 엔트리 삭제
  const handleGuestbookDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/guestbook/${id}` : `/api/guestbook/${id}`;
      
      const res = await fetch(apiUrl, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await loadGuestbookData();
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

  // 💾 데이터 저장 (API로)
  const saveData = async (data: ArchiveItem[]) => {
    setSaving(true);
    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/archive` : '/api/archive';
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMessage('✅ 저장 완료! 바로 반영되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('저장 실패');
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('❌ 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 📤 파일 업로드 (이미지/비디오)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    const backendUrl = getBackendUrl();
    const apiUrl = backendUrl ? `${backendUrl}/api/upload` : '/api/upload';

    setUploading(true);
    setMessage('📤 파일 업로드 중...');

    console.log('📤 Starting upload:', file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });

      console.log('📡 Upload response status:', res.status);

      if (res.ok) {
        const result = await res.json();
        console.log('✅ Upload result:', result);
        
        // R2를 사용하는 경우 URL 처리
        let fileUrl = result.url;
        if (!backendUrl && result.url.startsWith('/uploads/')) {
          // Cloudflare Pages에서 R2 사용 시
          // R2 Public Development URL 형식으로 변환 필요
          // 형식: https://pub-<account-id>.r2.dev/sdm-ape-lab-uploads/<filename>
          // 일단 상대 경로로 저장 (나중에 R2 Public URL로 변환)
          // 또는 R2 Public Development URL이 활성화되어 있다면 직접 사용 가능
          fileUrl = result.url;
        }
        
        setEditingItem({ ...editingItem, url: fileUrl });
        setMessage(`✅ 업로드 완료: ${result.originalName}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await res.json().catch(() => ({ error: '업로드 실패' }));
        console.error('❌ Upload failed:', errorData);
        
        // Cloudflare Pages에서 업로드 불가 안내
        if (errorData.error && errorData.error.includes('Cloudflare Pages')) {
          setMessage(`⚠️ ${errorData.message || errorData.error}\n\n${errorData.instruction || ''}`);
          setTimeout(() => setMessage(''), 10000);
        } else {
          setMessage(`❌ 업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
          setTimeout(() => setMessage(''), 5000);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ 업로드 중 오류가 발생했습니다: ' + (err as Error).message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploading(false);
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
      <div className="min-h-screen px-8 py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
              >
                관리자 페이지
              </h1>
              <p className="text-gray-400 text-sm">
                프로젝트를 추가/수정/삭제하면 <strong className="text-pink-400">즉시 반영</strong>됩니다!
              </p>
            </div>
            <button
              onClick={onExit}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'archive'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-white/50 hover:text-white/80'
              }`}
              style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
            >
              📁 Archive
            </button>
            <button
              onClick={() => setActiveTab('guestbook')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'guestbook'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-white/50 hover:text-white/80'
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
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors mb-6"
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
                className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-gray-500 text-sm font-mono">
                    [{String(item.id).padStart(3, '0')}]
                  </span>
                  <span className="text-white/60">
                    {item.type === 'youtube' ? '𓆛' : item.type === 'video' ? '𓁹' : '𓉔'}
                  </span>
                  <span 
                    className="text-white"
                    style={{ 
                      fontFamily: /[\u3131-\uD79D]/.test(item.title) 
                        ? 'Dotum, "돋움", sans-serif' 
                        : 'system-ui, -apple-system, sans-serif'
                    }}
                  >
                    {item.title}
                  </span>
                  <span className="text-gray-600 text-sm font-mono ml-auto">
                    {item.year}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAdding(false);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
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
          <div className="space-y-4">
            {guestbookEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group border border-white/10 rounded-lg p-4 hover:bg-gray-900 transition-colors"
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGuestbookUpdate(editingEntry)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingEntry(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 표시 모드
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-white font-medium text-sm">{entry.name}</span>
                          <span className="text-white/30 text-xs">{entry.date}</span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                          {entry.message}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleGuestbookDelete(entry.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
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
                className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
              >
                <h2 
                  className="text-2xl font-bold text-white mb-6"
                  style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                >
                  {isAdding ? '새 프로젝트 추가' : '프로젝트 수정'}
                </h2>

                {/* Type Selection */}
                <div className="mb-4">
                  <label 
                    className="block text-gray-400 text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    타입
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={editingItem.type === 'image'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'image' })}
                      />
                      🖼️ 이미지
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={editingItem.type === 'video'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'video' })}
                      />
                      🎬 비디오
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={editingItem.type === 'youtube'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'youtube' })}
                      />
                      📺 YouTube
                    </label>
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="radio"
                        checked={editingItem.type === 'website'}
                        onChange={() => setEditingItem({ ...editingItem, type: 'website' })}
                      />
                      🌐 웹사이트
                    </label>
                  </div>
                </div>

                {/* File Upload - Only for image/video */}
                {editingItem.type !== 'youtube' && editingItem.type !== 'website' && (
                  <div className="mb-4">
                    <label 
                      className="block text-gray-400 text-sm mb-2"
                      style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                    >
                      파일 업로드
                      {!getBackendUrl() && (
                        <span className="ml-2 text-yellow-400 text-xs">
                          (로컬에서만 가능)
                        </span>
                      )}
                    </label>
                    {!getBackendUrl() && (
                      <div className="mb-2 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                        <p 
                          className="text-xs text-yellow-400 mb-1"
                          style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                        >
                          ⚠️ Cloudflare Pages에서는 파일 업로드가 불가능합니다.
                        </p>
                        <p 
                          className="text-xs text-yellow-300/80"
                          style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                        >
                          로컬 개발 환경(localhost)에서만 파일 업로드가 가능합니다.
                        </p>
                        <p 
                          className="text-xs text-yellow-300/80 mt-1"
                          style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                        >
                          또는 외부 이미지 URL을 직접 입력하세요.
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept={editingItem.type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                      disabled={uploading || !getBackendUrl()}
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
                  </div>
                )}

                {/* URL */}
                <div className="mb-4">
                  <label 
                    className="block text-gray-400 text-sm mb-2"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    {editingItem.type === 'youtube' 
                      ? 'YouTube URL (필수)' 
                      : editingItem.type === 'website'
                      ? '웹사이트 URL (필수)'
                      : '또는 URL 직접 입력'}
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
                        : 'https://example.com/image.jpg'
                    }
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
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
                </div>

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

                {/* Validation Warning */}
                {!editingItem.url && (
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
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
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
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none resize-none"
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
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none font-mono"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editingItem.url || !editingItem.title}
                    className="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    style={{ fontFamily: 'Dotum, "돋움", sans-serif' }}
                  >
                    {saving ? '⏳ 저장 중...' : !editingItem.url ? '⚠️ URL 필요' : !editingItem.title ? '⚠️ 제목 필요' : '💾 저장'}
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
