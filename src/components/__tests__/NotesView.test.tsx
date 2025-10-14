import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { NotesView } from '../NotesView';
import { noteService } from '@/services/note.service';
import { noteLinksService } from '@/services/note-links.service';

vi.mock('@/services/note.service', () => ({
  noteService: {
    listNotes: vi.fn(),
  },
}));

vi.mock('@/services/note-links.service', () => ({
  noteLinksService: {
    getBacklinksToNote: vi.fn(),
  },
}));

describe('NotesView', () => {
  const mockNotes = [
    {
      $id: '1',
      title: 'Test Note 1',
      content: 'This note links to [[Test Note 2]].',
      contentHtml: '<p>This note links to <a href="#" data-note-id="2">Test Note 2</a>.</p>',
    },
    {
      $id: '2',
      title: 'Test Note 2',
      content: 'This is the second test note.',
      contentHtml: '<p>This is the second test note.</p>',
    },
  ];

  it('should render the notes and handle link clicks', async () => {
    vi.mocked(noteService.listNotes).mockResolvedValue(mockNotes as any);
    vi.mocked(noteLinksService.getBacklinksToNote).mockResolvedValue([]);
    render(<NotesView userId="user123" />);
    await screen.findByText('Test Note 1');

    fireEvent.click(screen.getByText('Test Note 2'));
    await screen.findByRole('dialog');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display backlinks', async () => {
    const mockBacklinks = [
      { $id: 'link1', sourceNoteId: '2', targetNoteId: '1' },
    ];
    vi.mocked(noteService.listNotes).mockResolvedValue(mockNotes as any);
    vi.mocked(noteLinksService.getBacklinksToNote).mockResolvedValue(mockBacklinks as any);
    render(<NotesView userId="user123" />);

    await screen.findByText('Test Note 1');
    fireEvent.click(screen.getByText('Test Note 1'));

    await screen.findByText('Backlinks');
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();
  });
});
