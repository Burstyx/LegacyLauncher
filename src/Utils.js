"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crash = void 0;
const remote_1 = __importDefault(require("@electron/remote"));
/**
 * Crash the launcher (For close all BrowserWindows)
 */
function crash() {
    remote_1.default.app.quit();
}
exports.crash = crash;
