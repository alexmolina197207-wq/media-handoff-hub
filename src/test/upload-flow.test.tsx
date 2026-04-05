import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import UploadPage from '@/pages/app/UploadPage';
import Library from '@/pages/app/Library';

const useAppMock = vi.fn();

vi.mock('@/context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('upload bulk tag persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(1);
    vi.stubGlobal('scrollTo', vi.fn());
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('saves bulk tags, folderId, and collectionId onto uploaded files and shows them in Library/detail', async () => {
    const state = {
      media: [] as Array<{
        id: string;
        title: string;
        type: 'image' | 'video';
        tags: string[];
        size: number;
        folderId: string | null;
        collectionId: string | null;
        previewUrl: string;
        notes: string;
        uploadedAt: string;
        source: string;
      }>,
      folders: [{ id: 'f1', name: 'Telegram', description: 'Folder', icon: '📨' }],
      collections: [{ id: 'c1', name: 'Q1 Campaign', purpose: 'Collection' }],
      tagPresets: [],
      addMedia: vi.fn((item) => {
        state.media = [item, ...state.media];
      }),
      addShareLink: vi.fn(),
      reorderMedia: vi.fn(),
    };

    useAppMock.mockImplementation(() => state);

    const uploadView = render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    const fileInput = uploadView.container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    fireEvent.change(fileInput, {
      target: { files: [new File(['seed'], 'seed.png', { type: 'image/png' })] },
    });

    const bulkInput = await screen.findByPlaceholderText('Add a tag…');
    fireEvent.change(bulkInput, { target: { value: 'marketing' } });
    fireEvent.keyDown(bulkInput, { key: 'Enter', code: 'Enter' });
    fireEvent.change(bulkInput, { target: { value: 'demo' } });
    fireEvent.keyDown(bulkInput, { key: 'Enter', code: 'Enter' });

    const selects = screen.getAllByRole('combobox');
    fireEvent.click(selects[0]);
    fireEvent.click(screen.getByText('📨 Telegram'));
    fireEvent.click(selects[1]);
    fireEvent.click(screen.getByText('Q1 Campaign'));

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(['first'], 'first.png', { type: 'image/png' }),
          new File(['second'], 'second.png', { type: 'image/png' }),
        ],
      },
    });

    await act(async () => {
      vi.runAllTimers();
    });

    await waitFor(() => expect(state.addMedia).toHaveBeenCalledTimes(3));

    const uploadedFiles = state.media.filter((item) => ['first.png', 'second.png'].includes(item.title));
    expect(uploadedFiles).toHaveLength(2);

    for (const file of uploadedFiles) {
      expect(file.tags).toEqual(['marketing', 'demo']);
      expect(file.folderId).toBe('f1');
      expect(file.collectionId).toBe('c1');
      expect(file.previewUrl).toContain('blob:');
    }

    uploadView.unmount();

    render(
      <MemoryRouter>
        <Library />
      </MemoryRouter>
    );

    for (const title of ['first.png', 'second.png']) {
      const card = screen.getByAltText(title).closest('.group');
      expect(card).toBeTruthy();
      expect(within(card as HTMLElement).getByText('marketing')).toBeInTheDocument();
      expect(within(card as HTMLElement).getByText('demo')).toBeInTheDocument();
    }

    fireEvent.click(screen.getByText('first.png'));

    expect(await screen.findByText('#marketing')).toBeInTheDocument();
    expect(screen.getByText('#demo')).toBeInTheDocument();
    expect(screen.getByText('📨 Telegram')).toBeInTheDocument();
    expect(screen.getByText('Q1 Campaign')).toBeInTheDocument();
  });
});