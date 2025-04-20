import { Command } from "commander";
import os from "os";
import path from "path";

// Shell configuration
const getShell = (): string => {
  if (process.env.SHELL) {
    return process.env.SHELL;
  }
  
  const shellProgram = new Command();
  shellProgram
    .name("mcp-shell")
    .description("MCP Shell Server - A server for executing shell commands")
    .version("0.1.0")
    .option("-s, --shell <shell>", "Specify the path to the shell to use");
  
  shellProgram.parse(process.argv);
  
  const options = shellProgram.opts();
  
  if (options.shell) {
    return options.shell;
  }
  
  // Set default shell based on OS
  return os.platform() === "win32" ? "cmd.exe" : "/bin/bash";
};

export const isUnderHome = (dirPath: string): boolean => {
  const homePath = os.homedir();
  
  const absoluteDirPath = path.resolve(dirPath);
  const absoluteHomePath = path.resolve(homePath);
  
  const relativePath = path.relative(absoluteHomePath, absoluteDirPath);
  
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
};

// Get working directory configuration
export const getWorkingDir = (): string => {
  const workingDirProgram = new Command();
  workingDirProgram
    .name("mcp-shell")
    .description("MCP Shell Server - A server for executing shell commands")
    .version("0.1.0")
    .option("-w, --working-dir <directory>", "Specify the working directory for command execution");
  
  workingDirProgram.parse(process.argv);
  
  const options = workingDirProgram.opts();
  
  if (options.workingDir) {
    return options.workingDir;
  }
  
  return os.homedir();
};

export default getShell;
