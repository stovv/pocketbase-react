import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { useAuth } from '../hooks/use-auth';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as content } from '../store/content';
import { ClientContext } from '../context/client';
import { AuthContext } from '../context/auth';
import type { BaseModel } from 'pocketbase';
import type PocketBase from 'pocketbase';

// Интерфейс для мока authStore
interface MockAuthStore {
  model: BaseModel | null;
  token: string;
  isValid: boolean;
  record: BaseModel | null;
  clear: Mock;
  save: Mock;
  onChange: Mock;
}

// Создаем фабрику для authStore
const createMockAuthStore = (): MockAuthStore => {
  let state = {
    model: null as BaseModel | null,
    token: '',
    isValid: false,
    record: null as BaseModel | null,
  };

  return {
    get model() {
      return state.model;
    },
    get token() {
      return state.token;
    },
    get isValid() {
      return state.isValid;
    },
    get record() {
      return state.record;
    },
    clear: vi.fn().mockImplementation(() => {
      state = { model: null, token: '', isValid: false, record: null };
    }),
    save: vi.fn().mockImplementation((token: string, model: BaseModel | null) => {
      state = { model, token, isValid: true, record: model };
    }),
    onChange: vi.fn(),
  };
};

// Мок PocketBase клиента
const mockAuthRefresh = vi.fn();
const mockGetOne = vi.fn();
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockOnChange = vi.fn();

let mockAuthStore: MockAuthStore;

beforeEach(() => {
  mockAuthStore = createMockAuthStore();
});

const createMockPocketBase = () =>
  ({
    baseUrl: 'http://localhost:8090',
    baseURL: 'http://localhost:8090',
    lang: 'en-US',
    authStore: mockAuthStore,
    collection: vi.fn().mockReturnValue({
      getOne: mockGetOne,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      authRefresh: mockAuthRefresh,
    }),
    health: {
      check: vi.fn().mockResolvedValue(true),
    },
  }) as unknown as InstanceType<typeof PocketBase>;

// Мок действий авторизации
const mockAuthActions = {
  registerWithEmail: vi.fn(),
  signInWithEmail: vi.fn(),
  signInWithProvider: vi.fn(),
  submitProviderResult: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  deleteUser: vi.fn(),
};

// Создаем store с middleware для игнорирования не-сериализуемых значений
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: { content },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

describe('useAuth', () => {
  let store: any;
  let wrapper: any;
  let mockPocketBase: InstanceType<typeof PocketBase>;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    store = createTestStore({
      content: {},
    });

    mockAuthStore = createMockAuthStore();
    mockPocketBase = createMockPocketBase();

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthContext.Provider value={mockAuthActions}>{children}</AuthContext.Provider>
        </ClientContext.Provider>
      </Provider>
    );

    vi.clearAllMocks();
    mockGetOne.mockResolvedValue(null);
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
    }
    mockSubscribe.mockClear();
    mockUnsubscribe.mockClear();
  });

  it('должен инициализироваться с начальным состоянием', () => {
    const { result } = renderHook(() => useAuth({}), { wrapper });

    expect(result.current.isSigned).toBe(false);
    expect(result.current.actions).toBe(mockAuthActions);
    expect(result.current.user).toBe(null);
  });

  it('должен обновлять состояние при изменении authStore', async () => {
    const mockUser = {
      id: '1',
      collectionId: 'users',
      collectionName: 'users',
    } as BaseModel;

    await act(async () => {
      mockAuthStore.save('valid-token', mockUser);
      mockAuthRefresh.mockResolvedValueOnce({ token: 'new-token' });
    });

    const { result } = renderHook(() => useAuth({}), { wrapper });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.isSigned).toBe(true);
        expect(mockAuthRefresh).toHaveBeenCalled();
      });
    });
  });

  it('должен вызывать authRefresh при успешной авторизации', async () => {
    await act(async () => {
      mockAuthStore.save('valid-token', null);
      mockAuthRefresh.mockResolvedValueOnce({ token: 'new-token' });
    });

    const { result } = renderHook(() => useAuth({}), { wrapper });

    await act(async () => {
      await vi.waitFor(() => {
        expect(mockAuthRefresh).toHaveBeenCalled();
      });
    });
  });

  it('должен обновлять состояние при изменении authStore через onChange', async () => {
    const { result } = renderHook(() => useAuth({}), { wrapper });

    const onChangeCallback = mockAuthStore.onChange.mock.calls[0][0];
    mockAuthStore.save('valid-token', null);

    await act(async () => {
      onChangeCallback();
    });

    expect(result.current.isSigned).toBe(true);
  });

  it('должен выбрасывать ошибку без AuthProvider', () => {
    const wrapperWithoutAuth = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          {children}
        </ClientContext.Provider>
      </Provider>
    );

    expect(() => {
      renderHook(() => useAuth({}), { wrapper: wrapperWithoutAuth });
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('должен корректно обрабатывать расширенные данные пользователя', async () => {
    const mockUser = {
      id: '1',
      collectionId: 'users',
      collectionName: 'users',
      expand: {
        profile: {
          id: '1',
          name: 'Test User',
        },
      },
    } as BaseModel;

    await act(async () => {
      mockAuthStore.save('valid-token', mockUser);
      mockGetOne.mockResolvedValueOnce(mockUser);
    });

    const { result } = renderHook(() => useAuth({ expand: ['profile'] }), { wrapper });

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.isSigned).toBe(true);
        expect(mockGetOne).toHaveBeenCalledWith(mockUser.id, { expand: ['profile'] });
      });
    });
  });

  it('должен отписываться от изменений при размонтировании', () => {
    const { unmount } = renderHook(() => useAuth({}), { wrapper });

    unmount();
    expect(mockAuthStore.onChange).toHaveBeenCalled();
  });
});
