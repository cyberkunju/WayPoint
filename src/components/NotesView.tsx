import { useState, useEffect } from 'react';
import { noteService, type Note } from '@/services/note.service';
import { noteLinksService, type NoteLink } from '@/services/note-links.service';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from '@phosphor-icons/react';
import { NoteDialog } from './NoteDialog';
import DOMPurify from 'dompurify';

interface NotesViewProps {
  userId: string;
}

export function NotesView({ userId }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [backlinks, setBacklinks] = useState<NoteLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    loadNotes();
  }, [userId]);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userNotes = await noteService.listNotes(userId);
      setNotes(userNotes);
    } catch (err) {
      setError('Failed to load notes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    setSelectedNote(undefined);
    setIsDialogOpen(true);
  };

  const handleEditNote = async (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
    const noteBacklinks = await noteLinksService.getBacklinksToNote(note.$id, userId);
    setBacklinks(noteBacklinks);
  };

  const handleSaveNote = (savedNote: Note) => {
    const existingNoteIndex = notes.findIndex((n) => n.$id === savedNote.$id);
    if (existingNoteIndex > -1) {
      const updatedNotes = [...notes];
      updatedNotes[existingNoteIndex] = savedNote;
      setNotes(updatedNotes);
    } else {
      setNotes([...notes, savedNote]);
    }
  };

  const renderNoteContent = (content: string) => {
    const linkRegex = /\[\[(.*?)\]\]/g;
    const replacedContent = content.replace(linkRegex, (match, noteTitle) => {
        const linkedNote = notes.find(n => n.title === noteTitle);
        if (linkedNote) {
            return `<a href="#" data-note-id="${linkedNote.$id}" class="text-primary hover:underline">${noteTitle}</a>`;
        }
        return match;
    });
    return DOMPurify.sanitize(replacedContent);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const noteId = target.dataset.noteId;
    if (noteId) {
      e.preventDefault();
      const noteToOpen = notes.find(n => n.$id === noteId);
      if (noteToOpen) {
        handleEditNote(noteToOpen);
      }
    }
  };

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button onClick={handleAddNote}>
          <Plus size={16} className="mr-2" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p>You haven't created any notes yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" onClick={handleContentClick}>
          {notes.map((note) => (
            <Card key={note.$id} className="cursor-pointer">
              <CardHeader onClick={() => handleEditNote(note)}>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose dark:prose-invert max-h-48 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: renderNoteContent(note.content) }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NoteDialog
        userId={userId}
        note={selectedNote}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveNote}
      />

        {backlinks.length > 0 && (
            <div className="mt-6">
                <h2 className="text-xl font-bold">Backlinks</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {backlinks.map(link => {
                    const backlinkedNote = notes.find(n => n.$id === link.sourceNoteId);
                    if (!backlinkedNote) return null;
                    return (
                        <Card key={link.$id} onClick={() => handleEditNote(backlinkedNote)} className="cursor-pointer">
                            <CardHeader>
                                <CardTitle>{backlinkedNote.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose dark:prose-invert max-h-48 overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: renderNoteContent(backlinkedNote.content) }}
                                />
                            </CardContent>
                        </Card>
                    );
                })}
                </div>
            </div>
        )}
    </div>
  );
}
