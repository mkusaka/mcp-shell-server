import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockMcpServer, mockZx } from './test-utils';

// Mock zx module
vi.mock('zx', () => {
  return {
    $: vi.fn().mockImplementation(() => Promise.resolve({
      stdout: 'test output',
      stderr: '',
      exitCode: 0,
      signal: null
    })),
  };
});

// Mock McpServer 
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: vi.fn().mockImplementation(() => mockMcpServer()),
    ResourceTemplate: vi.fn(),
  };
});

// Mock other dependencies
vi.mock('../shell-config.js', () => ({ 
  default: vi.fn().mockReturnValue('/bin/bash'),
  getWorkingDir: vi.fn().mockReturnValue('/home/test-user'),
  isUnderHome: vi.fn().mockImplementation((path) => path.startsWith('/home/test-user'))
}));
vi.mock('./lib/logger.js', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

describe('Shell Exec Tool', () => {
  let mcpServer;
  let shellExecHandler;
  
  beforeEach(async () => {
    vi.resetModules();
    
    // Import module to trigger tool registration
    await import('../index.js');
    
    // Get the mcpServer instance
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    mcpServer = vi.mocked(McpServer).mock.results[0].value;
    
    // Find the shell_exec tool registration
    const shellExecCall = mcpServer.tool.mock.calls.find(call => call[0] === 'shell_exec');
    shellExecHandler = shellExecCall ? shellExecCall[3] : null;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('registers shell_exec tool', () => {
    expect(mcpServer.tool).toHaveBeenCalledWith(
      'shell_exec',
      expect.any(String),
      expect.anything(),
      expect.any(Function)
    );
  });
  
  it('executes command and returns output', async () => {
    // Arrange
    const { $ } = await import('zx');
    vi.mocked($).mockResolvedValueOnce({
      stdout: 'command output',
      stderr: '',
      exitCode: 0,
      signal: null
    });
    
    // Act
    const result = await shellExecHandler({ command: 'echo test', workingDir: '/home/test-user' });
    
    // Assert
    expect($).toHaveBeenCalled();
    expect(result).toEqual({
      content: [{ 
        type: 'text', 
        text: 'command output' 
      }]
    });
  });
  
  it('handles command execution errors', async () => {
    // Arrange
    const { $ } = await import('zx');
    const error = new Error('Command failed');
    Object.assign(error, {
      stdout: '',
      stderr: 'error message',
      exitCode: 1,
      signal: null
    });
    vi.mocked($).mockRejectedValueOnce(error);
    
    // Act
    const result = await shellExecHandler({ command: 'invalid-command', workingDir: '/home/test-user' });
    
    // Assert
    expect(result).toEqual({
      content: [{ 
        type: 'text', 
        text: 'error message' 
      }],
      isError: true
    });
  });
});
