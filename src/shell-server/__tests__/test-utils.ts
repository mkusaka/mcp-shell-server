import { vi } from 'vitest';

// Mock McpServer
export const mockMcpServer = () => {
  return {
    name: '@mkusaka/mcp-shell-server',
    version: '0.1.0',
    tool: vi.fn(),
    resource: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
  };
};

// Mock for OS functions
export const mockOs = {
  platform: vi.fn().mockReturnValue('darwin'),
  hostname: vi.fn().mockReturnValue('test-host'),
  userInfo: vi.fn().mockReturnValue({ username: 'test-user' }),
  cpus: vi.fn().mockReturnValue(Array(4).fill({})),
  totalmem: vi.fn().mockReturnValue(8589934592), // 8GB
  freemem: vi.fn().mockReturnValue(4294967296), // 4GB
  uptime: vi.fn().mockReturnValue(3600), // 1 hour
};

// Mock for ZX
export const mockZx = {
  $: vi.fn().mockImplementation(() => ({
    stdout: 'test output',
    stderr: '',
  })),
};