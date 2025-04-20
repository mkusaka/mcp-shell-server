import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";
import os from "os";

vi.mock("os", async () => {
  const actual = await vi.importActual("os");
  return {
    ...actual,
    homedir: vi.fn().mockReturnValue("/home/user"),
  };
});

vi.mock("../shell-config.js", () => {
  return {
    default: vi.fn().mockReturnValue("/bin/bash"),
    getWorkingDir: vi.fn().mockReturnValue("/home/user"),
    isUnderHome: vi.fn().mockImplementation((dirPath) => {
      if (dirPath === "/home/user/projects") return true;
      if (dirPath === "/home/user") return true;
      if (dirPath === "/home/user/documents/files") return true;
      if (dirPath === "/var/www") return false;
      if (dirPath === "/tmp") return false;
      if (dirPath === "/home/otheruser") return false;
      if (dirPath === ".") return true;
      if (dirPath === "./subdir") return true;
      if (dirPath === "../documents") return true;
      if (dirPath === "../../..") return false;
      return false;
    }),
  };
});

describe("Working Directory Validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("validates paths under home directory", async () => {
    const { isUnderHome } = await import("../shell-config.js");

    expect(isUnderHome("/home/user/projects")).toBe(true);
    expect(isUnderHome("/home/user")).toBe(true);
    expect(isUnderHome("/home/user/documents/files")).toBe(true);

    expect(isUnderHome("/var/www")).toBe(false);
    expect(isUnderHome("/tmp")).toBe(false);
    expect(isUnderHome("/home/otheruser")).toBe(false);
  });

  it("handles relative paths correctly", async () => {
    const { isUnderHome } = await import("../shell-config.js");

    const originalCwd = process.cwd;
    process.cwd = vi.fn().mockReturnValue("/home/user/projects");

    expect(isUnderHome(".")).toBe(true);
    expect(isUnderHome("./subdir")).toBe(true);
    expect(isUnderHome("../documents")).toBe(true);

    expect(isUnderHome("../../..")).toBe(false);

    process.cwd = originalCwd;
  });
});
