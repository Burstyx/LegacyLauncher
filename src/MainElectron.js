"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// globals variables
var mainWindow;
// create main launcher window
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        icon: path_1.default.join(__dirname, "../assets/RiftenLogo.ico"),
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
    mainWindow.loadURL(path_1.default.join(__dirname, "../src/app.html"));
    // init Discord rpc
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// close launcher
electron_1.ipcMain.on("close-me", (evt, arg) => {
    electron_1.app.quit();
});
// download and start Minecraft
// ipcMain.on("play", async (evt, data) => {
//   await startMinecraft(evt, data.progressbar);
// });
// Minimiser le launcher
electron_1.ipcMain.on("reduceWindow", (evt) => {
    var _a;
    (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.minimize();
});
