import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '../context/auth';
import { ClientContext } from '../context/client';
import { StorageService } from '../services/storage';
import type { AuthProviderInfo } from 'pocketbase';
import type PocketBase from 'pocketbase';

// Мок для StorageService
vi.mock('../services/storage', () => ({
  StorageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('AuthProvider', () => {
  let mockPocketBase: InstanceType<typeof PocketBase>;
  let mockListAuthMethods: ReturnType<typeof vi.fn>;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockAuthWithPassword: ReturnType<typeof vi.fn>;
  let mockAuthWithOAuth2Code: ReturnType<typeof vi.fn>;
  let mockRequestPasswordReset: ReturnType<typeof vi.fn>;
  let mockRequestVerification: ReturnType<typeof vi.fn>;
  let mockRequestEmailChange: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListAuthMethods = vi.fn();
    mockCreate = vi.fn();
    mockAuthWithPassword = vi.fn();
    mockAuthWithOAuth2Code = vi.fn();
    mockRequestPasswordReset = vi.fn();
    mockRequestVerification = vi.fn();
    mockRequestEmailChange = vi.fn();
    mockDelete = vi.fn();
    mockUpdate = vi.fn();

    mockPocketBase = {
      collection: vi.fn().mockReturnValue({
        listAuthMethods: mockListAuthMethods,
        create: mockCreate,
        authWithPassword: mockAuthWithPassword,
        authWithOAuth2Code: mockAuthWithOAuth2Code,
        requestPasswordReset: mockRequestPasswordReset,
        requestVerification: mockRequestVerification,
        requestEmailChange: mockRequestEmailChange,
        delete: mockDelete,
        update: mockUpdate,
      }),
      authStore: {
        clear: vi.fn(),
      },
    } as unknown as InstanceType<typeof PocketBase>;

    mockListAuthMethods.mockResolvedValue({
      oauth2: {
        providers: [
          {
            name: 'google',
            state: 'state123',
            codeVerifier: 'verifier123',
            authURL: 'https://google.com/auth',
          },
        ] as AuthProviderInfo[],
      },
    });

    vi.clearAllMocks();
  });

  it('должен загружать методы аутентификации при монтировании', async () => {
    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <div>Test</div>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    expect(mockListAuthMethods).toHaveBeenCalled();
  });

  it('должен обрабатывать ошибки при загрузке методов аутентификации', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    mockListAuthMethods.mockRejectedValue(new Error('Failed to load'));

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <div>Test</div>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    expect(mockListAuthMethods).toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('должен регистрировать пользователя по email', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'test@example.com';
    const password = 'password123';

    await act(async () => {
      await authActions.registerWithEmail(email, password);
    });

    expect(mockCreate).toHaveBeenCalledWith({
      email,
      password,
      passwordConfirm: password,
    });
  });

  it('должен авторизовать пользователя по email', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'test@example.com';
    const password = 'password123';

    await act(async () => {
      await authActions.signInWithEmail(email, password);
    });

    expect(mockAuthWithPassword).toHaveBeenCalledWith(email, password);
  });

  it('должен авторизовать пользователя через провайдера', async () => {
    let authActions: any;
    const mockOpenURL = vi.fn();

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    await act(async () => {
      await authActions.signInWithProvider('google', mockOpenURL);
    });

    expect(StorageService.set).toHaveBeenCalledWith('provider', expect.any(String));
    expect(mockOpenURL).toHaveBeenCalledWith(
      'https://google.com/authhttp://localhost:3000/auth',
    );
  });

  it('должен обрабатывать результат авторизации через провайдера', async () => {
    let authActions: any;
    const mockCode = 'auth_code_123';
    const mockState = 'state123';
    const mockProviders = [
      {
        name: 'google',
        state: mockState,
        codeVerifier: 'verifier123',
        authURL: 'https://google.com/auth',
      },
    ];

    (StorageService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      JSON.stringify(mockProviders),
    );

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    await act(async () => {
      await authActions.submitProviderResult(`?code=${mockCode}&state=${mockState}`);
    });

    expect(mockAuthWithOAuth2Code).toHaveBeenCalledWith(
      'google',
      mockCode,
      'verifier123',
      'http://localhost:3000/auth',
    );
  });

  it('должен выходить из системы', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    await act(async () => {
      authActions.signOut();
    });

    expect(mockPocketBase.authStore.clear).toHaveBeenCalled();
  });

  it('должен отправлять email для сброса пароля', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'test@example.com';

    await act(async () => {
      await authActions.sendPasswordResetEmail(email);
    });

    expect(mockRequestPasswordReset).toHaveBeenCalledWith(email);
  });

  it('должен отправлять email для верификации', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'test@example.com';

    await act(async () => {
      await authActions.sendEmailVerification(email);
    });

    expect(mockRequestVerification).toHaveBeenCalledWith(email);
  });

  it('должен обновлять профиль пользователя', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const id = 'user123';
    const record = { name: 'Test User' };

    await act(async () => {
      await authActions.updateProfile(id, record);
    });

    expect(mockUpdate).toHaveBeenCalledWith(id, record);
  });

  it('должен обновлять email пользователя', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'new@example.com';

    await act(async () => {
      await authActions.updateEmail(email);
    });

    expect(mockRequestEmailChange).toHaveBeenCalledWith(email);
  });

  it('должен удалять пользователя', async () => {
    let authActions: any;

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const id = 'user123';

    await act(async () => {
      await authActions.deleteUser(id);
    });

    expect(mockDelete).toHaveBeenCalledWith(id);
  });

  it('должен обрабатывать отсутствие URL для перенаправления', async () => {
    let authActions: any;
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    const mockOpenURL = vi.fn();

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider>
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    await act(async () => {
      await authActions.signInWithProvider('google', mockOpenURL);
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Web redirect url or mobile redirect url is empty',
      expect.any(Object),
    );
  });

  it('должен обрабатывать ошибки сетевых запросов', async () => {
    let authActions: any;
    mockCreate.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(
        <ClientContext.Provider value={{ client: mockPocketBase }}>
          <AuthProvider webRedirectUrl="http://localhost:3000/auth">
            <AuthContext.Consumer>
              {(actions) => {
                authActions = actions;
                return null;
              }}
            </AuthContext.Consumer>
          </AuthProvider>
        </ClientContext.Provider>,
      );
    });

    const email = 'test@example.com';
    const password = 'password123';

    await expect(authActions.registerWithEmail(email, password)).rejects.toThrow(
      'Network error',
    );
  });
});
