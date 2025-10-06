import { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

export function useKeyboardShortcuts() {
  const { setCurrentView, setSearchQuery } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for Cmd/Ctrl modifier
      const isModifierPressed = e.metaKey || e.ctrlKey;

      if (isModifierPressed) {
        switch (e.key) {
          case '/':
            e.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case '1':
            e.preventDefault();
            setCurrentView('inbox');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('today');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('upcoming');
            break;
          case 'n':
            e.preventDefault();
            // Focus quick add input
            const quickAddInput = document.querySelector('input[placeholder*="Add a task"]') as HTMLInputElement;
            if (quickAddInput) {
              quickAddInput.focus();
            }
            break;
        }
      }

      // Handle escape key
      if (e.key === 'Escape') {
        // Clear search if it has content
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput && searchInput.value) {
          setSearchQuery('');
          searchInput.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView, setSearchQuery]);
}