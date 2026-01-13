import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestBookEntry {
  id: number;
  name: string;
  message: string;
  date: string;
}

const GuestBook: React.FC = () => {
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detect environment and construct backend URL
  const getBackendUrl = () => {
    if (typeof window === 'undefined') return '';
    
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isSandbox = hostname.includes('sandbox.novita.ai');
    
    if (isLocalhost) {
      return 'http://localhost:3001';
    } else if (isSandbox) {
      // Extract port from current URL and replace with backend port
      const currentOrigin = window.location.origin;
      return currentOrigin.replace(/\d{4}-/, '3001-');
    } else {
      // Cloudflare Pages or other production environment
      return '';
    }
  };

  // Load entries
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/guestbook` : '/api/guestbook';
      
      console.log('📖 Loading guestbook entries from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Loaded entries:', data.length);
      setEntries(data);
    } catch (error) {
      console.error('❌ Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      alert('이름과 메시지를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const backendUrl = getBackendUrl();
      const apiUrl = backendUrl ? `${backendUrl}/api/guestbook` : '/api/guestbook';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      // Clear form
      setName('');
      setMessage('');
      
      // Reload entries
      await loadEntries();
      
      alert('✅ 방명록에 글이 등록되었습니다!');
    } catch (error) {
      console.error('❌ Failed to submit:', error);
      alert('❌ 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      <div className="min-h-screen pt-24 pb-12 px-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                maxLength={50}
                className="w-full bg-transparent border-b border-white/10 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm"
                disabled={submitting}
              />
            </div>
            
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message..."
                maxLength={500}
                rows={4}
                className="w-full bg-transparent border-b border-white/10 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none text-sm"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2 border border-white/20 text-white/80 hover:bg-white/5 hover:text-white transition-all text-xs tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </motion.div>

        {/* Entries */}
        <div className="max-w-2xl mx-auto space-y-8">
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 pb-6"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-white text-sm font-medium">{entry.name}</span>
                  <span className="text-white/30 text-xs">{entry.date}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.message}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {entries.length === 0 && (
            <p className="text-center text-white/30 text-sm py-12">
              첫 번째 방명록을 남겨주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestBook;
