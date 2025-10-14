import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { NoteDialog } from '../NoteDialog';
import { noteService } from '@/services/note.service';
import { noteLinksService } from '@/services/note-links.service';

vi.mock('@/services/note.service', () => ({
  noteService: {
    createNote: vi.fn(),
    updateNote: vi.fn(),
    listNotes: vi.fn(),
  },
}));

vi.mock('@/services/note-links.service', () => ({
  noteLinksService: {
    createNoteLink: vi.fn(),
    deleteLinksFromNote: vi.fn(),
  },
}));

describe('NoteDialog', () => {
  it('should create a new note with links', async () => {
    const handleSave = vi.fn();
    vi.mocked(noteService.listNotes).mockResolvedValue([
      { $id: 'note2', title: 'Note 2' },
    ] as any);
    render(
      <NoteDialog
        userId="user123"
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Note' },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This note links to [[Note 2]].' },
    });

    vi.mocked(noteService.createNote).mockResolvedValue({
      $id: '3',
      title: 'New Note',
      content: 'This note links to [[Note 2]].',
    } as any);

    fireEvent.click(screen.getByText('Save'));

    await screen.findByText('Note created');

    expect(noteService.createNote).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'This note links to [[Note 2]].',
      userId: 'user123',
    });
    expect(noteLinksService.createNoteLink).toHaveBeenCalledWith({
      userId: 'user123',
      sourceNoteId: '3',
      targetNoteId: 'note2',
    });
    expect(handleSave).toHaveBeenCalled();
  });

  it('should edit an existing note and update links', async () => {
    const handleSave = vi.fn();
    const mockNote = {
      $id: '1',
      title: 'Test Note 1',
      content: 'This is the first test note.',
    };
    vi.mocked(noteService.listNotes).mockResolvedValue([
      { $id: 'note2', title: 'Note 2' },
    ] as any);
    render(
      <NoteDialog
        userId="user123"
        note={mockNote as any}
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Updated Note' },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'This note now links to [[Note 2]].' },
    });

    vi.mocked(noteService.updateNote).mockResolvedValue({
      ...mockNote,
      title: 'Updated Note',
      content: 'This note now links to [[Note 2]].',
    } as any);

    fireEvent.click(screen.getByText('Save'));

    await screen.findByText('Note updated');

    expect(noteService.updateNote).toHaveBeenCalledWith('1', {
      title: 'Updated Note',
      content: 'This note now links to [[Note 2]].',
      userId: 'user123',
    });
    expect(noteLinksService.deleteLinksFromNote).toHaveBeenCalledWith('1', 'user123');
    expect(noteLinksService.createNoteLink).toHaveBeenCalledWith({
      userId: 'user123',
      sourceNoteId: '1',
      targetNoteId: 'note2',
    });
    expect(handleSave).toHaveBeenCalled();
  });
});
