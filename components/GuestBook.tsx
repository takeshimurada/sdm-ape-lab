import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuestBookEntry {
  id: number;
  name: string;
  message: string;
  date: string;
  time?: string;
}

const GuestBook: React.FC = () => {
  const [entries, setEntries] = useState<GuestBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // Get user's language
  const getUserLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    return navigator.language.toLowerCase();
  };

  // Multi-language instructions
  const getInstructions = () => {
    const lang = getUserLanguage();
    
    if (lang.startsWith('ko')) {
      return '외계인을 만나면 전달할 메시지입니다. 신중히 당신을 나타내는 이름을 쓰고, 신중히 메시지를 남기시오.';
    } else if (lang.startsWith('ja')) {
      return '宇宙人に会ったら伝えるメッセージです。慎重に自分を表す名前を書き、慎重にメッセージを残してください。';
    } else if (lang.startsWith('zh')) {
      return '这是遇见外星人时要传达的信息。请慎重地写下代表你的名字，并慎重地留下信息。';
    } else if (lang.startsWith('es')) {
      return 'Este es un mensaje para entregar cuando encuentres a un extraterrestre. Escribe cuidadosamente un nombre que te represente y deja un mensaje con cuidado.';
    } else if (lang.startsWith('fr')) {
      return 'Ceci est un message à transmettre lorsque vous rencontrez un extraterrestre. Écrivez soigneusement un nom qui vous représente et laissez un message avec soin.';
    } else if (lang.startsWith('de')) {
      return 'Dies ist eine Nachricht, die Sie übermitteln können, wenn Sie einem Außerirdischen begegnen. Schreiben Sie sorgfältig einen Namen, der Sie repräsentiert, und hinterlassen Sie eine Nachricht mit Bedacht.';
    } else if (lang.startsWith('ru')) {
      return 'Это сообщение для передачи при встрече с инопланетянином. Тщательно напишите имя, которое вас представляет, и оставьте сообщение с осторожностью.';
    } else if (lang.startsWith('it')) {
      return 'Questo è un messaggio da consegnare quando incontri un alieno. Scrivi attentamente un nome che ti rappresenta e lascia un messaggio con cura.';
    } else if (lang.startsWith('pt')) {
      return 'Esta é uma mensagem para entregar quando você encontrar um alienígena. Escreva cuidadosamente um nome que o represente e deixe uma mensagem com cuidado.';
    } else {
      // Default: English
      return 'This is a message to deliver when you meet an alien. Carefully write a name that represents you and leave a message thoughtfully.';
    }
  };

  // 항상 Cloudflare Pages KV 사용 (하나의 DB)
  const getBackendUrl = () => {
    // 로컬에서도 Cloudflare Pages API 사용 (KV 동기화)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // 로컬에서도 Cloudflare Pages API 사용
      return 'https://88a85538.sdm-ape-lab.pages.dev';
    }
    
    // Cloudflare Pages에서는 상대 경로 사용
    return '';
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
      setStatusMessage({ type: 'error', text: 'communication Failed' });
      setTimeout(() => setStatusMessage({ type: null, text: '' }), 3000);
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: null, text: '' });

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
      
      // Show success message
      setStatusMessage({ type: 'success', text: 'communication success' });
      
      // Reload entries
      await loadEntries();
      
      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage({ type: null, text: '' }), 3000);
    } catch (error) {
      console.error('❌ Failed to submit:', error);
      setStatusMessage({ type: 'error', text: 'communication Failed' });
      setTimeout(() => setStatusMessage({ type: null, text: '' }), 3000);
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
      <div className="min-h-screen pt-28 sm:pt-32 md:pt-28 pb-12 px-4 sm:px-6">
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-6 sm:mb-8"
        >
          <p className="text-white/40 text-xs sm:text-sm leading-relaxed text-center italic px-2">
            {getInstructions()}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                maxLength={50}
                className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm sm:text-base"
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
                className="w-full bg-transparent border-b border-white/10 py-3 sm:py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none text-sm sm:text-base"
                disabled={submitting}
              />
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {statusMessage.type && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`px-4 py-3 border text-xs tracking-widest uppercase text-center ${
                    statusMessage.type === 'success'
                      ? 'border-green-500/50 text-green-400 bg-green-500/10'
                      : 'border-red-500/50 text-red-400 bg-red-500/10'
                  }`}
                >
                  {statusMessage.text}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white/80 hover:bg-white/5 active:bg-white/10 hover:text-white transition-all text-xs tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {submitting ? 'Submitting...' : 'communicate'}
            </button>
          </form>
        </motion.div>

        {/* Entries */}
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 pb-4 sm:pb-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 mb-2">
                  <span className="text-white text-sm font-medium">{entry.name}</span>
                  <span className="text-white/30 text-xs">
                    {entry.date} {entry.time && entry.time}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap break-words">
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
