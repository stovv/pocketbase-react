import React, { type ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useConnectionStatus } from '../hooks/use-connection-status';
import { ConnectionStatusProvider } from '../context/connection-status';
import { ClientProvider } from '../context/client';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClientContext } from '../context/client';
import { ConnectionStatusContext } from '../context/connection-status';
import type PocketBase from 'pocketbase';

// Mock for PocketBase client
const mockHealthCheck = vi.fn();
const mockPocketBase = {
  health: {
    check: mockHealthCheck,
  },
};

vi.mock('pocketbase', () => ({
  default: vi.fn(() => mockPocketBase),
}));

describe('useConnectionStatus', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ClientProvider serverURL="http://localhost:8090">
      <ConnectionStatusProvider checkInterval={30}>{children}</ConnectionStatusProvider>
    </ClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should throw an error when used outside of provider', () => {
    expect(() => {
      renderHook(() => useConnectionStatus());
    }).toThrow('useConnectionStatus must be used within a PocketBaseProvider');
  });

  it('should return true on successful connection check', async () => {
    mockHealthCheck.mockResolvedValue({});

    const { result } = renderHook(() => useConnectionStatus(), { wrapper });

    // Wait for the initial check to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
  });

  it('should return false on connection error', async () => {
    mockHealthCheck.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useConnectionStatus(), { wrapper });

    // Wait for the initial check to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(false);
  });

  it('should periodically check connection status', async () => {
    mockHealthCheck.mockResolvedValue({});

    renderHook(() => useConnectionStatus(), { wrapper });

    // Wait for the initial check to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockHealthCheck).toHaveBeenCalledTimes(1);

    // Advance time by 30 seconds (checkInterval in test)
    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(mockHealthCheck).toHaveBeenCalledTimes(2);
  });

  it('should clear interval on unmount', () => {
    mockHealthCheck.mockResolvedValue({});

    const { unmount } = renderHook(() => useConnectionStatus(), { wrapper });

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
