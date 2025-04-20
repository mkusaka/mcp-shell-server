#!/usr/bin/env node

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from "commander";
import { z } from "zod";
import { $, ProcessOutput } from "zx";
import { logger } from "./lib/logger.js";
import os from "os";
import getShell, { isUnderHome, getWorkingDir } from "./shell-config.js";

// CLI configuration is now handled in shell-config.js
// Get the shell to use
const shell = getShell();
const workingDir = getWorkingDir();

// Display server information
logger.info("MCP Shell Server started");
logger.info(`Shell: ${shell}`);
logger.info(`Working Directory: ${workingDir}`);
logger.info(`Platform: ${os.platform()}`);
logger.info(`Hostname: ${os.hostname()}`);
logger.info(`Username: ${os.userInfo().username}`);

// zx configuration for command execution
$.shell = shell;
$.verbose = false; // Disable zx debug output

// MCP server configuration
const server = new McpServer({
  name: "@mkusaka/mcp-shell-server",
  version: "0.1.0",
});

// System information resources
server.resource(
  "hostname",
  new ResourceTemplate("hostname://", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: os.hostname(),
      },
    ],
  }),
);

server.resource(
  "platform",
  new ResourceTemplate("platform://", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: os.platform(),
      },
    ],
  }),
);

server.resource(
  "shell",
  new ResourceTemplate("shell://", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: shell,
      },
    ],
  }),
);

server.resource(
  "username",
  new ResourceTemplate("username://", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: os.userInfo().username,
      },
    ],
  }),
);

// Combined system information resource
server.resource(
  "system-info",
  new ResourceTemplate("system-info://", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(
          {
            hostname: os.hostname(),
            platform: os.platform(),
            shell: shell,
            username: os.userInfo().username,
            cpus: os.cpus().length,
            totalmem: os.totalmem(),
            freemem: os.freemem(),
            uptime: os.uptime(),
          },
          null,
          2,
        ),
      },
    ],
  }),
);

// Shell command execution tool configuration
server.tool(
  "shell_exec",
  "Executes commands in the specified shell",
  {
    command: z.string().min(1),
    workingDir: workingDir ? z.string().optional() : z.string(),
  },
  async ({ command, workingDir: cmdWorkingDir }) => {
    try {
      logger.info(`Executing command: ${command}`);

      // Use command-specific working directory or fall back to global setting
      const execWorkingDir = cmdWorkingDir || workingDir;

      if (execWorkingDir && !isUnderHome(execWorkingDir)) {
        logger.error(
          `Working directory must be under $HOME: ${execWorkingDir}`,
        );
        return {
          content: [
            {
              type: "text",
              text: `Error: Working directory must be under $HOME: ${execWorkingDir}`,
            },
          ],
          isError: true,
        };
      }

      try {
        // Execute command using zx
        // Pass the command to the shell with -c option
        if (execWorkingDir) {
          $.cwd = execWorkingDir;
        }
        const result = await $`${shell} -c ${command}`;

        if (result.stderr) {
          logger.info(`Command warning: ${result.stderr}`);
        }

        // Return successful execution result
        return {
          content: [
            {
              type: "text",
              text:
                result.stdout ||
                "(Command executed successfully but produced no output)",
            },
          ],
        };
      } catch (execError) {
        // Command execution error (non-zero exit code)
        const error = execError as ProcessOutput;
        logger.error(
          `Command execution error: ${error.stderr || error.message}`,
        );
        return {
          content: [
            {
              type: "text",
              text: error.stderr || error.stdout || error.message,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      // Other error handling
      logger.error("Unexpected error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
logger.info("MCP Shell Server ready");
