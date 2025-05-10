import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCollection } from '../hooks/use-collection';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as content } from '../store/content';
import { ClientContext } from '../context/client';
import type { BaseModel, ListResult } from 'pocketbase';
import type PocketBase from 'pocketbase';

// Мок PocketBase клиента
const mockGetList = vi.fn().mockResolvedValue({
  items: [],
  totalItems: 0,
  page: 1,
  perPage: 20,
  totalPages: 1,
});

const mockPocketBase = {
  baseUrl: 'http://localhost:8090',
  baseURL: 'http://localhost:8090',
  lang: 'en-US',
  authStore: {
    model: null,
    token: '',
    isValid: true,
    clear: vi.fn(),
    save: vi.fn(),
    onChange: vi.fn(),
  },
  collection: vi.fn().mockReturnValue({
    getList: mockGetList,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }),
  health: {
    check: vi.fn().mockResolvedValue(true),
  },
} as unknown as InstanceType<typeof PocketBase>;

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { content },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['content/setClient', 'pocketbase-content/setCollection'],
          ignoredPaths: [
            'payload.client',
            'payload.client.authStore',
            'payload.client.collection',
            'payload.client.health',
          ],
        },
      }),
  });
};

describe('useCollection', () => {
  let store: any;
  let wrapper: any;

  beforeEach(() => {
    store = createTestStore({
      content: {},
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          {children}
        </ClientContext.Provider>
      </Provider>
    );

    // Сброс состояния моков перед каждым тестом
    vi.clearAllMocks();
    mockGetList.mockResolvedValue({
      items: [],
      totalItems: 0,
      page: 1,
      perPage: 20,
      totalPages: 1,
    });
  });

  it('должен инициализироваться с начальным состоянием', async () => {
    const { result } = renderHook(
      () => useCollection('test', { options: { limit: 20 } }),
      { wrapper },
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('должен обрабатывать успешную загрузку данных', async () => {
    const mockData = [
      { id: '1', collectionId: 'test', collectionName: 'test' },
      { id: '2', collectionId: 'test', collectionName: 'test' },
    ] as BaseModel[];

    mockGetList.mockResolvedValueOnce({
      items: mockData,
      totalItems: 2,
      page: 1,
      perPage: 20,
      totalPages: 1,
    } as ListResult<BaseModel>);

    const { result } = renderHook(
      () => useCollection('test', { options: { limit: 20 } }),
      { wrapper },
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.data).toHaveLength(2);
  });

  it('должен обрабатывать ошибки при загрузке', async () => {
    const error = new Error('Failed to fetch');
    mockGetList.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useCollection('test', { options: { limit: 20 } }),
      { wrapper },
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it('должен корректно обрабатывать пагинацию', async () => {
    const mockData1 = [
      { id: '1', collectionId: 'test', collectionName: 'test' },
      { id: '2', collectionId: 'test', collectionName: 'test' },
    ] as BaseModel[];

    const mockData2 = [
      { id: '3', collectionId: 'test', collectionName: 'test' },
      { id: '4', collectionId: 'test', collectionName: 'test' },
    ] as BaseModel[];

    mockGetList
      .mockResolvedValueOnce({
        items: mockData1,
        totalItems: 4,
        page: 1,
        perPage: 2,
        totalPages: 2,
      } as ListResult<BaseModel>)
      .mockResolvedValueOnce({
        items: mockData2,
        totalItems: 4,
        page: 2,
        perPage: 2,
        totalPages: 2,
      } as ListResult<BaseModel>);

    const { result } = renderHook(
      () => useCollection('test', { options: { limit: 2 } }),
      { wrapper },
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.isEnd).toBe(false);

    await act(async () => {
      result.current.next();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.data).toHaveLength(4);
    expect(result.current.isEnd).toBe(true);
  });
});
