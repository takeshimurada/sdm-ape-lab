import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHint: React.FC = () => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // 3초 후에 힌트 표시
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 3000);

    // 15초 후에 자동으로 숨김
    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 right-8 z-[90] pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg px-6 py-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-white text-sm font-medium mb-2">
                  관리자 페이지 접속
                </p>
                <div className="text-gray-400 text-xs space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px]">
                      Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px]">
                      Shift
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px]">
                      A
                    </kbd>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    비밀번호: <span className="text-pink-400">sdmapelab2025</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="text-gray-500 hover:text-white transition-colors pointer-events-auto cursor-none ml-auto"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminHint;
