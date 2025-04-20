import { Command } from "commander";
import os from "os";

// Shell configuration
const getShell = (): string => {
  if (process.env.SHELL) {
    return process.env.SHELL;
  }
  
  try {
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
  } catch (error) {
    console.error("Error parsing command line options:", error);
  }
  
  // Set default shell based on OS
  return os.platform() === "win32" ? "cmd.exe" : "/bin/bash";
};

export default getShell;
