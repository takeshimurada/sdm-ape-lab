import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  // 데이터 로드
  useEffect(() => {
    fetch('/archive-data.json')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to load data:', err));
  }, []);

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
  const handleSave = () => {
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
    
    // JSON 다운로드 (수동 백업)
    downloadJSON(updatedItems);
    
    setMessage('✅ 저장 완료! JSON 파일을 다운로드했습니다. public/archive-data.json에 복사하세요.');
    setEditingItem(null);
    setIsAdding(false);
  };

  // JSON 파일 다운로드
  const downloadJSON = (data: ArchiveItem[]) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archive-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 프로젝트 삭제
  const handleDelete = (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    downloadJSON(updatedItems);
    setMessage('🗑️ 삭제 완료! JSON 파일을 다운로드했습니다.');
  };

  // 이미지 업로드 (파일 → URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditingItem({ ...editingItem, url: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
      <div className="min-h-screen px-8 py-20">
        {/* 헤더 */}
        <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-white text-4xl font-light mb-2">Archive 관리</h1>
            <p className="text-gray-500 text-sm">프로젝트를 추가, 수정, 삭제할 수 있습니다</p>
          </div>
          <button
            onClick={onExit}
            className="text-white bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg transition-colors"
          >
            ← 돌아가기
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-6 bg-green-900/30 border border-green-500/50 text-green-300 px-6 py-4 rounded-lg"
          >
            {message}
          </motion.div>
        )}

        {/* 추가 버튼 */}
        <div className="max-w-6xl mx-auto mb-8">
          <button
            onClick={handleAdd}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + 새 프로젝트 추가
          </button>
        </div>

        {/* 프로젝트 리스트 */}
        <div className="max-w-6xl mx-auto grid gap-6">
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex gap-6"
            >
              {/* 미리보기 */}
              <div className="w-32 h-32 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1">
                <h3 className="text-white text-xl font-medium mb-2">{item.title}</h3>
                <div className="flex gap-2 mb-2">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="text-gray-400 text-sm bg-zinc-800 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm">
                  {item.type === 'video' ? '🎥 비디오' : '🖼️ 이미지'} · {item.year}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setEditingItem(item); setIsAdding(false); }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🗑️ 삭제
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 수정/추가 모달 */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-white text-2xl font-medium mb-6">
                {isAdding ? '새 프로젝트 추가' : '프로젝트 수정'}
              </h2>

              {/* 제목 */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">제목</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                  placeholder="프로젝트 제목"
                />
              </div>

              {/* 타입 선택 */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">타입</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditingItem({ ...editingItem, type: 'image' })}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      editingItem.type === 'image'
                        ? 'bg-pink-600 border-pink-600 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-gray-400'
                    }`}
                  >
                    🖼️ 이미지
                  </button>
                  <button
                    onClick={() => setEditingItem({ ...editingItem, type: 'video' })}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      editingItem.type === 'video'
                        ? 'bg-pink-600 border-pink-600 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-gray-400'
                    }`}
                  >
                    🎥 비디오
                  </button>
                </div>
              </div>

              {/* URL 또는 파일 업로드 */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">
                  {editingItem.type === 'video' ? '비디오 URL' : '이미지 URL 또는 업로드'}
                </label>
                <input
                  type="text"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 mb-2 focus:outline-none focus:border-pink-500"
                  placeholder="https://example.com/image.jpg"
                />
                {editingItem.type === 'image' && (
                  <div>
                    <label className="cursor-pointer inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      📁 파일 선택
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-xs mt-2">
                      또는 public/images/ 폴더에 파일을 넣고 /images/파일명.jpg 형식으로 입력
                    </p>
                  </div>
                )}
              </div>

              {/* 태그 */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={editingItem.tags.join(', ')}
                  onChange={(e) => setEditingItem({ 
                    ...editingItem, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                  placeholder="예: 연구, 실험, 비주얼"
                />
              </div>

              {/* 연도 */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">연도</label>
                <input
                  type="text"
                  value={editingItem.year}
                  onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                  placeholder="2025"
                />
              </div>

              {/* 미리보기 */}
              {editingItem.url && (
                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">미리보기</label>
                  <div className="w-full h-64 bg-zinc-800 rounded-lg overflow-hidden">
                    {editingItem.type === 'video' ? (
                      <video src={editingItem.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={editingItem.url} alt="preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  💾 저장
                </button>
                <button
                  onClick={() => { setEditingItem(null); setIsAdding(false); }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
