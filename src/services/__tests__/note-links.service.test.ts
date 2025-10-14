import { describe, it, expect, beforeEach, vi } from 'vitest';
import { noteLinksService } from '../note-links.service';
import { databaseService } from '../database.service';

vi.mock('../database.service', () => ({
  databaseService: {
    createDocument: vi.fn(),
    listDocuments: vi.fn(),
    deleteDocument: vi.fn(),
    batchDeleteDocuments: vi.fn(),
  },
  Query: {
    equal: vi.fn((field, value) => `equal("${field}", "${value}")`),
  },
}));

describe('NoteLinksService', () => {
  const mockUserId = 'user123';
  const mockNoteId1 = 'note1';
  const mockNoteId2 = 'note2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a note link', async () => {
    const mockNoteLink = {
      $id: 'link1',
      userId: mockUserId,
      sourceNoteId: mockNoteId1,
      targetNoteId: mockNoteId2,
    };
    vi.mocked(databaseService.createDocument).mockResolvedValue(mockNoteLink as any);

    const result = await noteLinksService.createNoteLink({
      userId: mockUserId,
      sourceNoteId: mockNoteId1,
      targetNoteId: mockNoteId2,
    });

    expect(result).toEqual(mockNoteLink);
    expect(databaseService.createDocument).toHaveBeenCalled();
  });

  it('should get links from a note', async () => {
    const mockNoteLinks = [
      { $id: 'link1', sourceNoteId: mockNoteId1, targetNoteId: mockNoteId2 },
      { $id: 'link2', sourceNoteId: mockNoteId1, targetNoteId: 'note3' },
    ];
    vi.mocked(databaseService.listDocuments).mockResolvedValue({ documents: mockNoteLinks } as any);

    const result = await noteLinksService.getLinksFromNote(mockNoteId1, mockUserId);

    expect(result).toEqual(mockNoteLinks);
    expect(databaseService.listDocuments).toHaveBeenCalled();
  });

  it('should get backlinks to a note', async () => {
    const mockNoteLinks = [
      { $id: 'link1', sourceNoteId: 'note3', targetNoteId: mockNoteId1 },
      { $id: 'link2', sourceNoteId: 'note4', targetNoteId: mockNoteId1 },
    ];
    vi.mocked(databaseService.listDocuments).mockResolvedValue({ documents: mockNoteLinks } as any);

    const result = await noteLinksService.getBacklinksToNote(mockNoteId1, mockUserId);

    expect(result).toEqual(mockNoteLinks);
    expect(databaseService.listDocuments).toHaveBeenCalled();
  });

  it('should delete a note link', async () => {
    await noteLinksService.deleteNoteLink('link1');
    expect(databaseService.deleteDocument).toHaveBeenCalledWith('note_links', 'link1');
  });

  it('should delete all links from a note', async () => {
    const mockNoteLinks = [
      { $id: 'link1', sourceNoteId: mockNoteId1, targetNoteId: mockNoteId2 },
      { $id: 'link2', sourceNoteId: mockNoteId1, targetNoteId: 'note3' },
    ];
    vi.mocked(databaseService.listDocuments).mockResolvedValue({ documents: mockNoteLinks } as any);

    await noteLinksService.deleteLinksFromNote(mockNoteId1, mockUserId);
    expect(databaseService.batchDeleteDocuments).toHaveBeenCalledWith('note_links', ['link1', 'link2']);
  });
});
