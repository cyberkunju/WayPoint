import { useState, useEffect } from 'react';
import { noteService, type Note } from '@/services/note.service';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from '@phosphor-icons/react';
import { NoteDialog } from './NoteDialog';

interface NotesViewProps {
  userId: string;
}

export function NotesView({ userId }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
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

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.$id} onClick={() => handleEditNote(note)} className="cursor-pointer">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose dark:prose-invert max-h-48 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: note.contentHtml || '' }}
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
    </div>
  );
}
