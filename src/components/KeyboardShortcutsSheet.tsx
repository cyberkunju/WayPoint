import React from 'react';
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
  const shortcutGroups = [
    {
      title: 'Navigation',
      shortcuts: [
        { key: 'Cmd/Ctrl + 1', description: 'Go to Inbox' },
        { key: 'Cmd/Ctrl + 2', description: 'Go to Today' },
        { key: 'Cmd/Ctrl + 3', description: 'Go to Upcoming' },
      ]
    },
    {
      title: 'Actions',
      shortcuts: [
        { key: 'Cmd/Ctrl + /', description: 'Focus search' },
        { key: 'Cmd/Ctrl + N', description: 'Focus quick add' },
        { key: 'Escape', description: 'Clear search / Close dialogs' },
      ]
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Keyboard size={16} />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="p-6">
        <SheetHeader>
          <SheetTitle>Keyboard Shortcuts</SheetTitle>
          <SheetDescription>
            Speed up your workflow with these helpful shortcuts.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">{group.title}</h4>
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2">
                {group.shortcuts.map((shortcut) => (
                  <React.Fragment key={shortcut.description}>
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 text-xs font-mono font-medium text-muted-foreground justify-self-end">
                      {shortcut.key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}