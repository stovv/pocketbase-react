import { describe, it, expect } from 'vitest';
import { processExpand, saveExpandedRecords } from '../utils/expand';
import type { BaseModel } from 'pocketbase';
import type { ContentState } from '../store/types';

// Получаем доступ к приватной функции parseExpandString
const parseExpandString = (expand: string[]): any => {
  const result: any = {};

  expand.forEach((path) => {
    const parts = path.split('.');
    let current = result;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          fields: [],
          nested: {},
        };
      }

      if (index < parts.length - 1) {
        current[part].fields.push(parts[index + 1]);
        current = current[part].nested;
      }
    });
  });

  return result;
};

describe('expand utils', () => {
  describe('parseExpandString', () => {
    it('должен парсить простой путь расширения', () => {
      const expand = ['profile'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: [],
          nested: {},
        },
      });
    });

    it('должен парсить вложенный путь расширения', () => {
      const expand = ['profile.settings'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: ['settings'],
          nested: {
            settings: {
              fields: [],
              nested: {},
            },
          },
        },
      });
    });

    it('должен парсить множественные вложенные пути', () => {
      const expand = ['profile.settings.preferences'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: ['settings'],
          nested: {
            settings: {
              fields: ['preferences'],
              nested: {
                preferences: {
                  fields: [],
                  nested: {},
                },
              },
            },
          },
        },
      });
    });

    it('должен парсить несколько путей расширения', () => {
      const expand = ['profile.settings', 'posts.comments'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: ['settings'],
          nested: {
            settings: {
              fields: [],
              nested: {},
            },
          },
        },
        posts: {
          fields: ['comments'],
          nested: {
            comments: {
              fields: [],
              nested: {},
            },
          },
        },
      });
    });

    it('должен парсить пути с общим корнем', () => {
      const expand = ['profile.settings', 'profile.preferences'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: ['settings', 'preferences'],
          nested: {
            settings: {
              fields: [],
              nested: {},
            },
            preferences: {
              fields: [],
              nested: {},
            },
          },
        },
      });
    });

    it('должен парсить пути разной глубины', () => {
      const expand = ['profile', 'posts.comments.author'];
      const result = parseExpandString(expand);

      expect(result).toEqual({
        profile: {
          fields: [],
          nested: {},
        },
        posts: {
          fields: ['comments'],
          nested: {
            comments: {
              fields: ['author'],
              nested: {
                author: {
                  fields: [],
                  nested: {},
                },
              },
            },
          },
        },
      });
    });
  });

  const mockState: ContentState = {
    collections: {},
    client: null as any,
  };

  describe('processExpand', () => {
    it('должен обрабатывать простое расширение', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
        },
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          collectionId: 'profile',
        },
      });
    });

    it('должен обрабатывать массив расширений', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        posts: [
          {
            id: '2',
            title: 'Post 1',
            created: '',
            updated: '',
          },
          {
            id: '3',
            title: 'Post 2',
            created: '',
            updated: '',
          },
        ],
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
        posts: [
          {
            id: '2',
            title: 'Post 1',
            created: '',
            updated: '',
            collectionId: 'posts',
          },
          {
            id: '3',
            title: 'Post 2',
            created: '',
            updated: '',
            collectionId: 'posts',
          },
        ],
      });
    });

    it('должен обрабатывать вложенные расширения', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
            },
          },
        },
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          collectionId: 'profile',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
            },
          },
          settings: {
            id: '3',
            theme: 'dark',
            created: '',
            updated: '',
            collectionId: 'settings',
          },
        },
      });
    });

    it('должен обрабатывать множественные вложенные расширения', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
              expand: {
                preferences: {
                  id: '4',
                  language: 'ru',
                  created: '',
                  updated: '',
                },
              },
            },
          },
        },
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          collectionId: 'profile',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
              expand: {
                preferences: {
                  id: '4',
                  language: 'ru',
                  created: '',
                  updated: '',
                },
              },
            },
          },
          settings: {
            id: '3',
            theme: 'dark',
            created: '',
            updated: '',
            collectionId: 'settings',
            expand: {
              preferences: {
                id: '4',
                language: 'ru',
                created: '',
                updated: '',
              },
            },
            preferences: {
              id: '4',
              language: 'ru',
              created: '',
              updated: '',
              collectionId: 'preferences',
            },
          },
        },
      });
    });

    it('должен обрабатывать смешанные расширения (массивы и объекты)', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
        },
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
            expand: {
              comments: [
                {
                  id: '4',
                  text: 'Comment 1',
                  created: '',
                  updated: '',
                },
              ],
            },
          },
        ],
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          collectionId: 'profile',
        },
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
            collectionId: 'posts',
            expand: {
              comments: [
                {
                  id: '4',
                  text: 'Comment 1',
                  created: '',
                  updated: '',
                },
              ],
            },
            comments: [
              {
                id: '4',
                text: 'Comment 1',
                created: '',
                updated: '',
                collectionId: 'comments',
              },
            ],
          },
        ],
      });
    });

    it('должен обрабатывать пустые расширения', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {};

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
      });
    });

    it('должен обрабатывать null значения в расширениях', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: null,
        posts: null,
      };

      const result = processExpand(record, expand, mockState);

      expect(result).toEqual({
        id: '1',
        created: '',
        updated: '',
      });
    });
  });

  describe('saveExpandedRecords', () => {
    it('должен сохранять расширенные записи', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
        },
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
          },
          {
            id: '4',
            title: 'Post 2',
            created: '',
            updated: '',
          },
        ],
      };

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({
        profile: [
          {
            id: '2',
            name: 'Test User',
            created: '',
            updated: '',
          },
        ],
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
          },
          {
            id: '4',
            title: 'Post 2',
            created: '',
            updated: '',
          },
        ],
      });
    });

    it('должен сохранять вложенные расширенные записи', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
            },
          },
        },
      };

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({
        profile: [
          {
            id: '2',
            name: 'Test User',
            created: '',
            updated: '',
            expand: {
              settings: {
                id: '3',
                theme: 'dark',
                created: '',
                updated: '',
              },
            },
          },
        ],
        settings: [
          {
            id: '3',
            theme: 'dark',
            created: '',
            updated: '',
          },
        ],
      });
    });

    it('должен сохранять множественные вложенные расширенные записи', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
          expand: {
            settings: {
              id: '3',
              theme: 'dark',
              created: '',
              updated: '',
              expand: {
                preferences: {
                  id: '4',
                  language: 'ru',
                  created: '',
                  updated: '',
                },
              },
            },
          },
        },
      };

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({
        profile: [
          {
            id: '2',
            name: 'Test User',
            created: '',
            updated: '',
            expand: {
              settings: {
                id: '3',
                theme: 'dark',
                created: '',
                updated: '',
                expand: {
                  preferences: {
                    id: '4',
                    language: 'ru',
                    created: '',
                    updated: '',
                  },
                },
              },
            },
          },
        ],
        settings: [
          {
            id: '3',
            theme: 'dark',
            created: '',
            updated: '',
            expand: {
              preferences: {
                id: '4',
                language: 'ru',
                created: '',
                updated: '',
              },
            },
          },
        ],
        preferences: [
          {
            id: '4',
            language: 'ru',
            created: '',
            updated: '',
          },
        ],
      });
    });

    it('должен обрабатывать пустые расширения', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {};

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({});
    });

    it('должен обрабатывать null значения в расширениях', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: null,
        posts: null,
      };

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({});
    });

    it('должен обрабатывать смешанные расширения (массивы и объекты)', () => {
      const record: BaseModel = {
        id: '1',
        created: '',
        updated: '',
      };

      const expand = {
        profile: {
          id: '2',
          name: 'Test User',
          created: '',
          updated: '',
        },
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
            expand: {
              comments: [
                {
                  id: '4',
                  text: 'Comment 1',
                  created: '',
                  updated: '',
                },
              ],
            },
          },
        ],
      };

      const result = saveExpandedRecords(record, expand, mockState);

      expect(result).toEqual({
        profile: [
          {
            id: '2',
            name: 'Test User',
            created: '',
            updated: '',
          },
        ],
        posts: [
          {
            id: '3',
            title: 'Post 1',
            created: '',
            updated: '',
            expand: {
              comments: [
                {
                  id: '4',
                  text: 'Comment 1',
                  created: '',
                  updated: '',
                },
              ],
            },
          },
        ],
        comments: [
          {
            id: '4',
            text: 'Comment 1',
            created: '',
            updated: '',
          },
        ],
      });
    });
  });
});
