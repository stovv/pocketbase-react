import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecord } from '../hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as content } from '../store/content';
import { ClientContext } from '../context/client';
import type { BaseModel } from 'pocketbase';
import type PocketBase from 'pocketbase';

// Мок PocketBase клиента
const mockGetOne = vi.fn();
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();

// Создаем store с middleware для игнорирования не-сериализуемых значений
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { content },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Отключаем проверку сериализуемости для тестов
      }),
  });
};

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
    getOne: mockGetOne,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
  }),
  health: {
    check: vi.fn().mockResolvedValue(true),
  },
} as unknown as InstanceType<typeof PocketBase>;

describe('useRecord', () => {
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
    mockGetOne.mockResolvedValue(null);
  });

  it('должен инициализироваться с начальным состоянием', () => {
    const { result } = renderHook(() => useRecord('test', null), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.isDeleted).toBe(false);
  });

  it('должен обрабатывать успешную загрузку данных', async () => {
    const mockData = {
      id: '1',
      collectionId: 'test',
      collectionName: 'test',
    } as BaseModel;

    mockGetOne.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRecord('test', '1'), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.data).toBe(null); // Данные будут null, так как они сохраняются в store
    expect(mockGetOne).toHaveBeenCalledWith('1', { expand: undefined });
  });

  it('должен обрабатывать ошибки при загрузке', async () => {
    const error = new Error('Failed to fetch');
    mockGetOne.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRecord('test', '1'), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it('должен обрабатывать удаление записи через подписку', async () => {
    const mockData = {
      id: '1',
      collectionId: 'test',
      collectionName: 'test',
    } as BaseModel;

    mockGetOne.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRecord('test', '1'), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Симулируем событие удаления через подписку
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    await act(async () => {
      await subscribeCallback({ action: 'delete', record: mockData });
    });

    expect(result.current.isDeleted).toBe(true);
    expect(mockUnsubscribe).toHaveBeenCalledWith('1');
  });

  it('должен обрабатывать обновление записи через подписку', async () => {
    const mockData = {
      id: '1',
      collectionId: 'test',
      collectionName: 'test',
    } as BaseModel;

    const updatedMockData = {
      ...mockData,
      someField: 'updated',
    };

    mockGetOne.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRecord('test', '1'), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Симулируем событие обновления через подписку
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    await act(async () => {
      await subscribeCallback({ action: 'update', record: updatedMockData });
    });

    expect(result.current.isDeleted).toBe(false);
  });

  it('должен отписываться при размонтировании', async () => {
    const { unmount } = renderHook(() => useRecord('test', '1'), { wrapper });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledWith('1');
  });
});
