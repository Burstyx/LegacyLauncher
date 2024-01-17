// imports
import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import getAppDataPath from "appdata-path";
import fs from "fs";

// globals variables
var mainWindow: BrowserWindow;

// create main launcher window
async function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "../assets/RiftenLogo.ico"),
    title: "RiftenRP Launcher",
    backgroundColor: "#121212",
    width: 900,
    height: 552,
    minWidth: 900,
    minHeight: 552,
    maxWidth: 900,
    maxHeight: 552,
    resizable: false,
    center: true,
    fullscreenable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true, //TODO désactiver dev tool
    },
  });

  require("@electron/remote/main").initialize();
  require("@electron/remote/main").enable(mainWindow.webContents);
  mainWindow.webContents.openDevTools(); 
  mainWindow.setMenu(null);
  mainWindow.loadURL(path.join(__dirname, "../src/app.html"));
  // init Discord rpc
}

app.on("ready", createWindow);

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// close launcher
ipcMain.on("close-me", (evt, arg) => {
  app.quit();
});

// download and start Minecraft
// ipcMain.on("play", async (evt, data) => {
//   await startMinecraft(evt, data.progressbar);
// });

// Minimiser le launcher
ipcMain.on("reduceWindow", (evt) => {
  BrowserWindow.getFocusedWindow()?.minimize();
});
