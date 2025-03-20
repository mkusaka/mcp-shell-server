import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Backup original environment variables
const originalEnv = { ...process.env };

// Create the mock functions
const mockPlatform = vi.fn();
const mockOpts = vi.fn();

// Mock the modules outside of the tests
vi.mock('os', async () => {
  const actual = await vi.importActual('os');
  return {
    ...actual,
    platform: mockPlatform,
    default: {
      ...actual.default,
      platform: mockPlatform
    }
  };
});

vi.mock('commander', () => ({
  program: {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    parse: vi.fn(),
    opts: mockOpts
  }
}));

vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('Shell configuration', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Reset modules to ensure clean imports for each test
    vi.resetModules();
    
    // Reset environment variables for each test
    process.env = { ...originalEnv };
    delete process.env.SHELL;
    
    // Set default mock values
    mockPlatform.mockReturnValue('darwin');
    mockOpts.mockReturnValue({});
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = { ...originalEnv };
  });
  
  it('uses SHELL environment variable if set', async () => {
    // Set environment variable
    process.env.SHELL = '/env/shell';
    
    // Import the shell config module
    const { default: getShell } = await import('../shell-config.js');
    
    // Test
    expect(getShell()).toBe('/env/shell');
  });
  
  it('uses shell from command line options if specified', async () => {
    // Set mock for commander.program.opts()
    mockOpts.mockReturnValue({ shell: '/custom/shell' });
    
    // Import the shell config module
    const { default: getShell } = await import('../shell-config.js');
    
    // Test
    expect(getShell()).toBe('/custom/shell');
  });
  
  it('falls back to default shell for Unix', async () => {
    // Set mocks
    mockPlatform.mockReturnValue('darwin');
    mockOpts.mockReturnValue({});
    
    // Import the shell config module
    const { default: getShell } = await import('../shell-config.js');
    
    // Test
    expect(getShell()).toBe('/bin/bash');
  });
  
  it('falls back to cmd.exe for Windows', async () => {
    // Set mocks
    mockPlatform.mockReturnValue('win32');
    mockOpts.mockReturnValue({});
    
    // Import the module with Windows setting
    const { default: getShell } = await import('../shell-config.js');
    
    // Test
    expect(getShell()).toBe('cmd.exe');
  });
});