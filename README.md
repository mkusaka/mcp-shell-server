# MCP Shell Server

A server that uses the Model Context Protocol (MCP) to execute shell commands. It functions as a bridge that allows AI agents to safely execute shell commands.

## Features

- Execute shell commands (single-line and multi-line support)
- Support for various shells (bash, zsh, fish, powershell, cmd, etc.)
- Detailed error handling and logging
- MCP Inspector compatible

## Installation

### From npm (as a user)

```bash
# Using npm
npm install -g @mkusaka/mcp-shell-server

# Using yarn
yarn global add @mkusaka/mcp-shell-server

# Using pnpm
pnpm add -g @mkusaka/mcp-shell-server
```

### From source (for development)

```bash
# Clone the repository
git clone https://github.com/mkusaka/mcp-shell-server.git
cd mcp-shell-server

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Usage

### Direct Execution

```bash
node dist/index.js
# or as an executable
./dist/index.js
```

### Development Mode

```bash
pnpm dev
```

### Testing with MCP Inspector

```bash
pnpm inspect
```

## Command Line Arguments

```
-s, --shell <shell>  Specify the path to the shell to use
-h, --help           Display help message
-V, --version        Display version information
```

## Tool Reference

### shell_exec

Executes commands in the specified shell.

Parameters:
- `command` (string, required): The shell command to execute

### Usage Examples

#### Basic Command Execution

```json
{
  "name": "shell_exec",
  "parameters": {
    "command": "echo Hello, World!"
  }
}
```

#### Multi-line Command (Heredoc) Execution

```json
{
  "name": "shell_exec",
  "parameters": {
    "command": "cat << EOF | grep 'example'\nThis is an example text.\nAnother line without the keyword.\nEOF"
  }
}
```

## Development

### Project Structure

```
src/
├── index.ts                # Main entry point
└── shell-server/
    ├── index.ts            # Shell server implementation
    └── lib/
        └── logger.ts       # Logging configuration
```

### Logging

Logs are written to the `mcp-shell.log` file.

## License

MIT