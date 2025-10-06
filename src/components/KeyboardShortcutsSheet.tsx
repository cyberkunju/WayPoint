import { Button } from './ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription 
} from './ui/sheet';
import { Keyboard } from '@phosphor-icons/react';

export function KeyboardShortcutsSheet() {
  const shortcuts = [
    { key: 'Cmd/Ctrl + /', description: 'Focus search' },
    { key: 'Cmd/Ctrl + N', description: 'Focus quick add' },
    { key: 'Cmd/Ctrl + 1', description: 'Go to Inbox' },
    { key: 'Cmd/Ctrl + 2', description: 'Go to Today' },
    { key: 'Cmd/Ctrl + 3', description: 'Go to Upcoming' },
    { key: 'Escape', description: 'Clear search / Close dialogs' },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard size={16} />
          Shortcuts
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keyboard Shortcuts</SheetTitle>
          <SheetDescription>
            Speed up your workflow with these helpful shortcuts
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 text-xs font-mono font-medium text-muted-foreground">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}