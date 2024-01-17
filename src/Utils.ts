import remote from "@electron/remote";

/**
 * Crash the launcher (For close all BrowserWindows)
 */
export function crash() {
  remote.app.quit();
}
