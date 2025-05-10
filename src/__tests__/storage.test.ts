import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';

// Мок для AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Мок для localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

describe('StorageService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Устанавливаем моки для localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  it('должен сохранять значение', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await StorageService.set(key, value);

    // Проверяем, что значение было сохранено в localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(key, value);
  });

  it('должен получать значение', async () => {
    const key = 'testKey';
    const value = 'testValue';
    localStorageMock.getItem.mockReturnValue(value);

    const result = await StorageService.get(key);

    expect(result).toBe(value);
    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
  });

  it('должен удалять значение', async () => {
    const key = 'testKey';

    await StorageService.remove(key);

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(key);
  });

  it('должен возвращать null при получении несуществующего значения', async () => {
    const key = 'nonexistentKey';
    localStorageMock.getItem.mockReturnValue(null);

    const result = await StorageService.get(key);

    expect(result).toBeNull();
  });
});
