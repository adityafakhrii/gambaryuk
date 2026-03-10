import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function useKeyboardShortcuts() {
    const { toggleTheme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isModifier = e.ctrlKey || e.metaKey;
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            // Ctrl/Cmd+K → Focus search (only on homepage)
            if (isModifier && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('tool-search') as HTMLInputElement | null;
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Alt+T → Toggle theme (when not in input)
            if (e.altKey && e.key === 't' && !isInput) {
                e.preventDefault();
                toggleTheme();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleTheme]);
}
