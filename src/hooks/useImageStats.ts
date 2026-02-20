import { useState, useEffect } from 'react';

const STATS_KEY = 'gambaryuk_stats';

interface ImageStats {
  totalProcessed: number;
  sessionStart: number;
}

function getStats(): ImageStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalProcessed: 0, sessionStart: Date.now() };
}

function saveStats(stats: ImageStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useImageStats() {
  const [stats, setStats] = useState<ImageStats>(getStats);

  const incrementProcessed = (count = 1) => {
    setStats((prev) => {
      const next = { ...prev, totalProcessed: prev.totalProcessed + count };
      saveStats(next);
      return next;
    });
  };

  // Re-sync on focus (in case another tab updated)
  useEffect(() => {
    const onFocus = () => setStats(getStats());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return { stats, incrementProcessed };
}

// Standalone helper to increment from tool pages
export function trackImageProcessed(count = 1) {
  try {
    const stats = getStats();
    stats.totalProcessed += count;
    saveStats(stats);
  } catch {}
}
