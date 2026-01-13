import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Archive item type
interface ArchiveItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  tags: string[];
  year: string;
}

const AdminPage: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 📖 데이터 로드 (API에서)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/archive');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setMessage('❌ 데이터 로드 실패');
    }
  };

  // 💾 데이터 저장 (API로)
  const saveData = async (data: ArchiveItem[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/archive', {
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

    setUploading(true);
    setMessage('📤 파일 업로드 중...');

    console.log('📤 Starting upload:', file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('📡 Upload response status:', res.status);

      if (res.ok) {
        const result = await res.json();
        console.log('✅ Upload result:', result);
        
        setEditingItem({ ...editingItem, url: result.url });
        setMessage(`✅ 업로드 완료: ${result.originalName}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorText = await res.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error('업로드 실패');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ 업로드 중 오류가 발생했습니다: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // 새 프로젝트 추가
  const handleAdd = () => {
    const newItem: ArchiveItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      type: 'image',
      url: '',
      title: '새 프로젝트',
      tags: [],
      year: new Date().getFullYear().toString()
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
              <h1 className="text-3xl font-bold text-white mb-2">🔐 관리자 페이지</h1>
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
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors"
          >
            + 새 프로젝트 추가
          </button>
        </div>

        {/* Projects Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500/30 transition-colors"
            >
              {/* Preview */}
              <div className="relative aspect-square bg-gray-800">
                {item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    className="w-full h-full object-cover" 
                    muted 
                    loop 
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                )}
                
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {item.type === 'video' ? '🎬 VIDEO' : '🖼️ IMAGE'}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mb-4">{item.year}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAdding(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isAdding ? '새 프로젝트 추가' : '프로젝트 수정'}
                </h2>

                {/* Type Selection */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">타입</label>
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
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">파일 업로드</label>
                  <input
                    type="file"
                    accept={editingItem.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-pink-500 file:text-white
                      hover:file:bg-pink-600
                      file:cursor-pointer cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-sm text-pink-400 mt-2">⏳ 업로드 중...</p>
                  )}
                </div>

                {/* URL (optional) */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">
                    또는 URL 직접 입력 (Unsplash, Imgur 등)
                  </label>
                  <input
                    type="text"
                    value={editingItem.url}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                  />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">제목</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                  />
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">
                    태그 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={editingItem.tags.join(', ')}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="Research, Photography, Art"
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                  />
                </div>

                {/* Year */}
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">연도</label>
                  <input
                    type="text"
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="2025"
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-pink-500 outline-none"
                  />
                </div>

                {/* URL Preview */}
                {editingItem.url && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">미리보기 URL:</p>
                    <p className="text-xs text-green-400 break-all">{editingItem.url}</p>
                  </div>
                )}

                {/* Validation Warning */}
                {!editingItem.url && (
                  <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      ⚠️ 파일을 업로드하거나 URL을 입력해주세요.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editingItem.url || !editingItem.title}
                    className="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                  >
                    {saving ? '⏳ 저장 중...' : !editingItem.url ? '⚠️ URL 필요' : !editingItem.title ? '⚠️ 제목 필요' : '💾 저장'}
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
