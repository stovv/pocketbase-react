import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFileFields } from '../utils/files';
import { resolveFileUrl } from '../utils/resolve-file-url';
import type { FileFields } from '../types';
import type PocketBase from 'pocketbase';

// Мок для PocketBase клиента
const mockGetURL = vi.fn();
const mockClient = {
  files: {
    getURL: mockGetURL,
  },
} as unknown as InstanceType<typeof PocketBase>;

describe('files utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetURL.mockReturnValue('http://example.com/file.jpg');
  });

  describe('resolveFileUrl', () => {
    it('должен возвращать URL файла', () => {
      const record = {
        id: '1',
        collectionId: 'test',
      };

      const result = resolveFileUrl(mockClient, record, 'file.jpg');

      expect(result).toBe('http://example.com/file.jpg');
      expect(mockGetURL).toHaveBeenCalledWith(record, 'file.jpg', { thumb: '100x250' });
    });

    it('должен возвращать undefined при отсутствии необходимых параметров', () => {
      expect(
        resolveFileUrl(
          null as unknown as InstanceType<typeof PocketBase>,
          null,
          undefined,
        ),
      ).toBeUndefined();
      expect(resolveFileUrl(mockClient, null, undefined)).toBeUndefined();
      expect(
        resolveFileUrl(mockClient, { id: '1', collectionId: 'test' }, undefined),
      ).toBeUndefined();
    });

    it('должен использовать пользовательские опции', () => {
      const record = {
        id: '1',
        collectionId: 'test',
      };

      const options = { thumb: '200x200' };

      resolveFileUrl(mockClient, record, 'file.jpg', options);

      expect(mockGetURL).toHaveBeenCalledWith(record, 'file.jpg', options);
    });

    it('должен обрабатывать различные типы файлов', () => {
      const record = {
        id: '1',
        collectionId: 'test',
      };

      const fileTypes = [
        'image.jpg',
        'image.png',
        'image.gif',
        'document.pdf',
        'document.doc',
        'archive.zip',
      ];

      fileTypes.forEach((file) => {
        mockGetURL.mockReturnValueOnce(`http://example.com/${file}`);
        const result = resolveFileUrl(mockClient, record, file);
        expect(result).toBe(`http://example.com/${file}`);
        expect(mockGetURL).toHaveBeenCalledWith(record, file, { thumb: '100x250' });
      });
    });

    it('должен обрабатывать специальные символы в именах файлов', () => {
      const record = {
        id: '1',
        collectionId: 'test',
      };

      const fileNames = [
        'file with spaces.jpg',
        'file_with_underscores.jpg',
        'file-with-dashes.jpg',
        'file(with)parentheses.jpg',
        'file[with]brackets.jpg',
        'file{with}braces.jpg',
      ];

      fileNames.forEach((file) => {
        mockGetURL.mockReturnValueOnce(`http://example.com/${file}`);
        const result = resolveFileUrl(mockClient, record, file);
        expect(result).toBe(`http://example.com/${file}`);
        expect(mockGetURL).toHaveBeenCalledWith(record, file, { thumb: '100x250' });
      });
    });
  });

  describe('processFileFields', () => {
    it('должен обрабатывать одиночные файловые поля', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: 'avatar.jpg',
        cover: 'cover.jpg',
      };

      const fileFields: FileFields = {
        single: ['avatar', 'cover'],
        multiple: [],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        avatar: 'http://example.com/file.jpg',
        cover: 'http://example.com/file.jpg',
      });

      expect(mockGetURL).toHaveBeenCalledTimes(2);
    });

    it('должен обрабатывать множественные файловые поля', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        photos: ['photo1.jpg', 'photo2.jpg'],
        documents: ['doc1.pdf', 'doc2.pdf'],
      };

      const fileFields: FileFields = {
        single: [],
        multiple: ['photos', 'documents'],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        photos: ['http://example.com/file.jpg', 'http://example.com/file.jpg'],
        documents: ['http://example.com/file.jpg', 'http://example.com/file.jpg'],
      });

      expect(mockGetURL).toHaveBeenCalledTimes(4);
    });

    it('должен обрабатывать и одиночные, и множественные поля', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: 'avatar.jpg',
        photos: ['photo1.jpg', 'photo2.jpg'],
      };

      const fileFields: FileFields = {
        single: ['avatar'],
        multiple: ['photos'],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        avatar: 'http://example.com/file.jpg',
        photos: ['http://example.com/file.jpg', 'http://example.com/file.jpg'],
      });

      expect(mockGetURL).toHaveBeenCalledTimes(3);
    });

    it('должен возвращать исходную запись при отсутствии fileFields', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: 'avatar.jpg',
      };

      const result = processFileFields(mockClient, record, undefined);

      expect(result).toBe(record);
      expect(mockGetURL).not.toHaveBeenCalled();
    });

    it('должен возвращать исходную запись при отсутствии клиента', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: 'avatar.jpg',
      };

      const fileFields: FileFields = {
        single: ['avatar'],
        multiple: [],
      };

      const result = processFileFields(
        null as unknown as InstanceType<typeof PocketBase>,
        record,
        fileFields,
      );

      expect(result).toBe(record);
      expect(mockGetURL).not.toHaveBeenCalled();
    });

    it('должен пропускать отсутствующие поля', () => {
      const record = {
        id: '1',
        collectionId: 'test',
      };

      const fileFields: FileFields = {
        single: ['avatar'],
        multiple: ['photos'],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
      });

      expect(mockGetURL).not.toHaveBeenCalled();
    });

    it('должен обрабатывать пустые массивы в множественных полях', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        photos: [],
        documents: [],
      };

      const fileFields: FileFields = {
        single: [],
        multiple: ['photos', 'documents'],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        photos: [],
        documents: [],
      });

      expect(mockGetURL).not.toHaveBeenCalled();
    });

    it('должен обрабатывать null значения в полях', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: null,
        photos: null,
      };

      const fileFields: FileFields = {
        single: ['avatar'],
        multiple: ['photos'],
      };

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        avatar: null,
        photos: null,
      });

      expect(mockGetURL).not.toHaveBeenCalled();
    });

    it('должен обрабатывать различные типы файлов в полях', () => {
      const record = {
        id: '1',
        collectionId: 'test',
        avatar: 'avatar.jpg',
        cover: 'cover.png',
        photos: ['photo1.gif', 'photo2.webp'],
        documents: ['doc1.pdf', 'doc2.docx'],
      };

      const fileFields: FileFields = {
        single: ['avatar', 'cover'],
        multiple: ['photos', 'documents'],
      };

      mockGetURL
        .mockReturnValueOnce('http://example.com/avatar.jpg')
        .mockReturnValueOnce('http://example.com/cover.png')
        .mockReturnValueOnce('http://example.com/photo1.gif')
        .mockReturnValueOnce('http://example.com/photo2.webp')
        .mockReturnValueOnce('http://example.com/doc1.pdf')
        .mockReturnValueOnce('http://example.com/doc2.docx');

      const result = processFileFields(mockClient, record, fileFields);

      expect(result).toEqual({
        id: '1',
        collectionId: 'test',
        avatar: 'http://example.com/avatar.jpg',
        cover: 'http://example.com/cover.png',
        photos: ['http://example.com/photo1.gif', 'http://example.com/photo2.webp'],
        documents: ['http://example.com/doc1.pdf', 'http://example.com/doc2.docx'],
      });

      expect(mockGetURL).toHaveBeenCalledTimes(6);
    });
  });
});
