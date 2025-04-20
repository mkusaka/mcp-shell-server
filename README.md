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

## MCP Configuration

### Cursor Configuration

Add the following to your Cursor configuration file (`~/.cursor/config.json`):

```json
{
  "mcpServers": {
    "shell": {
      "command": "npx",
      "args": ["-y", "@mkusaka/mcp-shell-server"]
    }
  }
}
```

### Cline Integration

[Cline](https://github.com/saoudrizwan/cline) はVS Code拡張機能で、Claude AIとMCPサーバーを利用できます。このMCPシェルサーバーをClineで設定するには：

1. Cline MCP設定ファイルを開きます：

   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. シェルサーバーのMCP設定を追加します：

   ```json
   {
     "mcpServers": {
       "shell": {
         "command": "npx",
         "args": ["-y", "@mkusaka/mcp-shell-server"],
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   あるいは、ローカルにインストールしたパッケージを使用する場合：

   ```json
   {
     "mcpServers": {
       "shell": {
         "command": "node",
         "args": ["/path/to/mcp-shell-server/dist/index.js"],
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

### Rule Configuration

AIアシスタントのルールやプロンプトに以下を追加してください：

```
You have MCP Shell tools at your disposal. Follow these rules regarding Shell tool usage:
1. ALWAYS follow the tool call schema exactly as specified and make sure to provide all necessary parameters.
2. **NEVER refer to tool names when speaking to me.** For example, instead of saying 'I need to use the shell_exec tool to run this command', just say 'I'll run that command for you'.
3. Only use Shell tools when they are necessary. If my task is general or you already know the answer, just respond without calling tools.
4. When I ask you to execute shell commands, use the appropriate tool to:
   - Run single-line commands
   - Run multi-line commands (using heredoc syntax when appropriate)
   - Execute file operations, git commands, or system utilities
   - Provide system information when relevant
5. Always be careful with shell commands that might modify the system, and explain what the command will do before executing it.
6. If a shell command produces an error, explain what went wrong in simple terms and suggest ways to fix it.
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

## Resource Reference

The server provides the following system information as resources:

### hostname

Returns the hostname of the system.

URI: `hostname://`

### platform

Returns the operating system platform.

URI: `platform://`

### shell

Returns the shell path being used by the server.

URI: `shell://`

### username

Returns the current username.

URI: `username://`

### system-info

Returns comprehensive system information in JSON format, including:
- hostname
- platform
- shell
- username
- CPU count
- Total memory
- Free memory
- System uptime

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
