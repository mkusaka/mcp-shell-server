# Best Practices for Developing MCP Servers with TypeScript

This document outlines the best practices and patterns we've discovered while creating MCP (Model Context Protocol) servers using TypeScript. These guidelines aim to help you create robust, maintainable, and effective MCP servers.

## Project Structure

```
src/
├── index.ts                    # Main entry point
├── your-server/                # Server implementation namespace
│   ├── index.ts                # Main server implementation
│   ├── lib/                    # Supporting modules
│   │   ├── logger.ts           # Logging configuration
│   │   └── utils.ts            # Utility functions
│   └── services/               # Services used by your server
│       └── example-service.ts  # Service implementations
├── types/                      # Type definitions
└── config/                     # Configuration
```

- Keep a clear separation of concerns with modules for different aspects of functionality
- Use a single entry point (`index.ts`) to bootstrap your application
- Organize supporting code in logical directories

## Logging

### Best Practices

1. **Avoid console output in MCP servers**
   - Console output can interfere with the MCP protocol's stdout/stdin communication
   - Use file-based logging instead

2. **Configure a proper logger**
   ```typescript
   // lib/logger.ts
   import winston from "winston";
   import path from "path";

   export const logger = winston.createLogger({
     level: "info",
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ 
         filename: path.join(process.cwd(), "your-server.log")
       })
       // Console output is disabled to avoid interfering with MCP protocol communication
     ]
   });
   ```

3. **Add useful context to log messages**
   - Include operation names, parameters (without sensitive data), and timestamps
   - Use structured logging to make logs parseable

## MCP Server Configuration

```typescript
// Basic MCP server setup
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "your-server-name",
  version: "1.0.0"
});

// Configure tools, connect transports, etc.
// ...

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
```

- Use semantic versioning for your server version
- Choose a clear, descriptive name for your server

## Tool Implementation

### Validation with Zod

Use Zod to define and validate parameters:

```typescript
import { z } from "zod";

// Define tool with validation
server.tool(
  "example_tool",
  "Description of what the tool does",
  {
    // Define parameters with validation
    required_param: z.string().min(1),
    optional_param: z.number().optional(),
    enum_param: z.enum(["option1", "option2", "option3"]).default("option1")
  },
  async ({ required_param, optional_param, enum_param }) => {
    // Tool implementation
    // ...
    return {
      content: [{ 
        type: "text", 
        text: "Result of operation" 
      }]
    };
  }
);
```

- Define clear parameter validation rules
- Use appropriate Zod types and validations
- Add descriptions to parameters when helpful

### Error Handling

Implement thorough error handling:

```typescript
server.tool(
  "example_tool",
  "Description of what the tool does",
  {
    param: z.string()
  },
  async ({ param }) => {
    try {
      // Main operation
      const result = await someOperation(param);
      
      return {
        content: [{ 
          type: "text", 
          text: result 
        }]
      };
    } catch (error) {
      // Log the error
      logger.error(`Error in example_tool: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return error response
      return {
        content: [{ 
          type: "text", 
          text: `Error: ${error instanceof Error ? error.message : String(error)}` 
        }],
        isError: true
      };
    }
  }
);
```

- Always catch and handle exceptions
- Log errors with context
- Return friendly error messages to clients
- Set `isError: true` on error responses

## CLI Arguments and Configuration

Use Commander.js for command-line argument parsing:

```typescript
import { program } from "commander";

program
  .name("your-server-name")
  .description("Description of your MCP server")
  .version("1.0.0")
  .option("-o, --option <value>", "Description of option")
  .option("-f, --flag", "Description of flag");

program.parse();
const options = program.opts();
```

- Provide clear help text and descriptions
- Follow standard CLI conventions for options
- Implement sensible defaults

## Testing

### Testing with MCP Inspector

Set up npm scripts to facilitate testing:

```json
{
  "scripts": {
    "inspect": "mcp-inspector dist/index.js"
  }
}
```

- Regularly test your server with MCP Inspector
- Create test cases for all tools and edge cases
- Validate error handling behavior

## Packaging and Publishing

### Package.json Configuration

```json
{
  "name": "@your-scope/your-server-name",
  "version": "1.0.0",
  "description": "Description of your MCP server",
  "type": "module",
  "bin": {
    "your-server-name": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc && shx chmod +x dist/index.js",
    "prepublishOnly": "npm run build"
  }
}
```

- Use a scope for your package name if appropriate
- Include a binary entry point if your server should be executable
- Add prepublishOnly script to ensure the package is built before publishing
- Specify which files to include in the published package

### .npmrc Configuration

```
access=public
```

- Configure public access for scoped packages

## README Documentation

Include:

1. Clear description of your server and its purpose
2. Installation instructions
3. Usage examples for each tool
4. Configuration options
5. Development setup instructions
6. Command-line arguments reference
7. License information

## Security Considerations

1. **Input Validation**
   - Always validate and sanitize user inputs
   - Use Zod for parameter validation
   - Be cautious with dynamic code execution

2. **Environment Variables**
   - Use environment variables for secrets and configuration
   - Provide clear documentation on required environment variables
   - Validate environment variables at startup

3. **Rate Limiting and Throttling**
   - Implement rate limiting for API calls to external services
   - Add backoff strategies for retries

## Performance

1. **Efficient Resource Usage**
   - Close connections and free resources when done
   - Be mindful of memory usage, especially for large responses
   - Use streams for large data transfers when appropriate

2. **Asynchronous Programming**
   - Use async/await consistently
   - Avoid blocking the event loop
   - Consider parallel operations where appropriate

## Monitoring and Debugging

1. **Structured Logging**
   - Use structured logging format (JSON)
   - Include context information in logs
   - Log at appropriate levels (info, warn, error)

2. **Health Checks**
   - Add health check capabilities if your server integrates with external services
   - Log startup information and configuration

## Conclusion

By following these best practices, you'll create MCP servers that are:
- Robust and reliable
- Well-documented and maintainable
- Secure and performant
- Easy to deploy and use

Remember that the Model Context Protocol is evolving, so stay updated with the latest MCP SDK versions and best practices.

---

© 2025 Your Name or Organization