import { program } from "commander";
import os from "os";

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

export default getShell;