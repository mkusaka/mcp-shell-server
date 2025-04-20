import { program } from "commander";
import os from "os";
import path from "path";

// Shell configuration
const getShell = (): string => {
  // Initialize program if not already done
  if (!program.opts) {
    program
      .name("mcp-shell")
      .description("MCP Shell Server - A server for executing shell commands")
      .version("0.1.0")
      .option("-s, --shell <shell>", "Specify the path to the shell to use");
    
    program.parse();
  }

  const options = program.opts();
  
  if (options.shell) {
    return options.shell;
  }
  
  if (process.env.SHELL) {
    return process.env.SHELL;
  }
  
  // Set default shell based on OS
  return os.platform() === "win32" ? "cmd.exe" : "/bin/bash";
};

export const isUnderHome = (dirPath: string): boolean => {
  const homePath = os.homedir();
  
  const absoluteDirPath = path.resolve(dirPath);
  const absoluteHomePath = path.resolve(homePath);
  
  return absoluteDirPath.startsWith(absoluteHomePath);
};

// Get working directory configuration
export const getWorkingDir = (): string => {
  // Initialize program if not already done
  if (!program.opts) {
    program
      .name("mcp-shell")
      .description("MCP Shell Server - A server for executing shell commands")
      .version("0.1.0")
      .option("-s, --shell <shell>", "Specify the path to the shell to use")
      .option("-w, --working-dir <directory>", "Specify the working directory for command execution");
    
    program.parse();
  }

  const options = program.opts();
  
  if (options.workingDir) {
    return options.workingDir;
  }
  
  return os.homedir();
};

export default getShell;
