# MCP Shell Server Specification

## Overview

The MCP Shell Server is a server that uses the Model Context Protocol (MCP) to execute shell commands. It functions as a bridge that allows AI agents to safely execute shell commands.

## Functional Specifications

### 1. Shell Command Execution

- Tool name: `shell_exec`
- Description: Executes commands in the specified shell
- Parameters:
  - `command` (string): The shell command to execute

#### Execution Flow

1. Receive the command string
2. Execute the command using the configured shell (or default shell)
3. Return the execution result (standard output or standard error output)
4. Return appropriate error messages if errors occur

#### Supported Features

- Single-line command execution
- Multi-line command execution (heredoc, etc.)
- Support for various shells (bash, zsh, fish, powershell, cmd, etc.)

### 2. Shell Configuration

- Shell can be specified via command-line options at startup
- Uses the user's `SHELL` environment variable by default
- Auto-detects based on OS if environment variable is not set
  - UNIX-like systems: `/bin/bash`
  - Windows: `cmd.exe`

### 3. Server Information

Displays the following information at startup:
- Shell in use
- Platform
- Hostname
- Username

## Technical Specifications

### Technologies

- TypeScript: Development language
- MCP SDK: MCP protocol implementation
- ZX: Shell command execution library
- Commander: Command-line argument parsing

### Command-line Arguments

- `-s, --shell <shell>`: Specify the path to the shell to use
- `-h, --help`: Display help message
- `-V, --version`: Display version information

### Error Handling

- Command execution failure: Returns error message and details
- Invalid parameters: Notifies with InvalidParameters error code
- Non-existent tool invocation: Notifies with ToolNotFound error code

## Interface Specifications

### MCP Protocol Interface

- Transport: StdioServerTransport
- Supported tools:
  - `shell_exec`: Shell command execution

### Shell Command Execution Interface

- Input: Command string
- Output: Execution result string (on success) or error information (on failure)

## Usage Examples

### Basic Command Execution

```json
{
  "name": "shell_exec",
  "parameters": {
    "command": "echo Hello, World!"
  }
}
```

### Multi-line Command (Heredoc) Execution

```json
{
  "name": "shell_exec",
  "parameters": {
    "command": "cat << EOF | grep 'example'\nThis is an example text.\nAnother line without the keyword.\nEOF"
  }
}
```

### GitHub Pull Request Creation (Complex Example)

```json
{
  "name": "shell_exec",
  "parameters": {
    "command": "cat << EOF | gh pr create --title \"New Feature\" --body-file -\n## Summary\nThis is a PR for a new feature.\n\n## Changes\n- Feature A: Add login functionality\n- Feature B: Profile editing functionality\n\n## Tested Items\n- [x] Unit tests\n- [x] Integration tests\nEOF"
  }
}
```