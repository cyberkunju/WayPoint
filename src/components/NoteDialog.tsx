import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { noteService, type Note, type NoteDocument } from '@/services/note.service';
import { toast } from 'sonner';
import { useTaskStore } from '@/hooks/use-store';

interface NoteDialogProps {
  userId: string;
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export function NoteDialog({ userId, note, isOpen, onClose, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, isOpen]);

  const handleSave = async () => {
    if (!title) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      let savedNote: Note;
      const noteData: Partial<NoteDocument> = {
        title,
        content,
        userId,
      };

      if (note) {
        savedNote = await noteService.updateNote(note.$id, noteData);
        toast.success('Note updated');
      } else {
        savedNote = await noteService.createNote(noteData as NoteDocument);
        toast.success('Note created');
      }
      onSave(savedNote);
      onClose();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Add Note'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 items-start gap-4">
            <Label htmlFor="content">Content</Label>
            {/* Rich Text Editor Placeholder */}
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-4 h-48 p-2 border rounded-md"
              placeholder="Start writing your note..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
