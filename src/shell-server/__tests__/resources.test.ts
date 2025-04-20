import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Create a mock for the ResourceTemplate
class MockResourceTemplate {
  constructor(public uriTemplate: string, public options: any) {}
}

// Mock the McpServer class
class MockServer {
  resources = new Map();
  tools = new Map();
  
  resource(name, template, handler) {
    this.resources.set(name, { template, handler });
    return this;
  }
  
  tool(name, description, schema, handler) {
    this.tools.set(name, { description, schema, handler });
    return this;
  }
  
  connect() {
    return Promise.resolve();
  }
}

// Mock os module
vi.mock('os', async () => {
  return {
    platform: vi.fn().mockReturnValue('darwin'),
    hostname: vi.fn().mockReturnValue('test-host'),
    userInfo: vi.fn().mockReturnValue({ username: 'test-user' }),
    cpus: vi.fn().mockReturnValue(Array(4).fill({})),
    totalmem: vi.fn().mockReturnValue(8589934592),
    freemem: vi.fn().mockReturnValue(4294967296),
    uptime: vi.fn().mockReturnValue(3600),
    default: {
      platform: vi.fn().mockReturnValue('darwin'),
      hostname: vi.fn().mockReturnValue('test-host'),
      userInfo: vi.fn().mockReturnValue({ username: 'test-user' }),
      cpus: vi.fn().mockReturnValue(Array(4).fill({})),
      totalmem: vi.fn().mockReturnValue(8589934592),
      freemem: vi.fn().mockReturnValue(4294967296),
      uptime: vi.fn().mockReturnValue(3600)
    }
  };
});

// Mock shell config
vi.mock('../shell-config.js', () => {
  return {
    default: vi.fn().mockReturnValue('/bin/test/bash'),
    getWorkingDir: vi.fn().mockReturnValue('/home/test-user'),
    isUnderHome: vi.fn().mockImplementation((path) => path.startsWith('/home/test-user'))
  };
});

// Mock logger
vi.mock('../lib/logger.js', () => {
  return {
    logger: {
      info: vi.fn(),
      error: vi.fn()
    }
  };
});

// Mock zx
vi.mock('zx', () => {
  return {
    $: vi.fn(),
    default: {
      $: vi.fn()
    }
  };
});

// Mock the SDK
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: vi.fn().mockImplementation(() => new MockServer()),
    ResourceTemplate: vi.fn().mockImplementation((uri, options) => new MockResourceTemplate(uri, options))
  };
});

// Mock the TransportClass
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({}))
  };
});

describe('Resources', () => {
  let serverInstance;
  
  beforeEach(async () => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Reset modules
    vi.resetModules();
    
    // Import the module (this triggers the resource registration)
    await import('../index.js');
    
    // Get the server instance
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    serverInstance = vi.mocked(McpServer).mock.results[0].value;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('registers hostname resource', () => {
    expect(serverInstance.resources.has('hostname')).toBe(true);
  });
  
  it('registers platform resource', () => {
    expect(serverInstance.resources.has('platform')).toBe(true);
  });
  
  it('registers shell resource', () => {
    expect(serverInstance.resources.has('shell')).toBe(true);
  });
  
  it('registers username resource', () => {
    expect(serverInstance.resources.has('username')).toBe(true);
  });
  
  it('registers system-info resource', () => {
    expect(serverInstance.resources.has('system-info')).toBe(true);
  });
  
  it('registers all five resources', () => {
    const expectedResources = ['hostname', 'platform', 'shell', 'username', 'system-info'];
    
    // Verify all resources are registered
    expectedResources.forEach(resourceName => {
      expect(serverInstance.resources.has(resourceName)).toBe(true);
    });
    
    // Verify the total count
    expect(serverInstance.resources.size).toBe(5);
  });
  
  it('hostname resource returns correct value', async () => {
    const resource = serverInstance.resources.get('hostname');
    const result = await resource.handler({ href: 'hostname://' });
    
    expect(result).toEqual({
      contents: [{
        uri: 'hostname://',
        text: 'test-host'
      }]
    });
  });
  
  it('platform resource returns correct value', async () => {
    const resource = serverInstance.resources.get('platform');
    const result = await resource.handler({ href: 'platform://' });
    
    expect(result).toEqual({
      contents: [{
        uri: 'platform://',
        text: 'darwin'
      }]
    });
  });
});
