"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRpcClientState = void 0;
const discord_rpc_1 = __importDefault(require("discord-rpc"));
const rpc = new discord_rpc_1.default.Client({ transport: "ipc" });
rpc.on("ready", async () => {
    setRpcClientState("Dans le launcher", false, "logo");
    console.log("Discord RPC prêt !");
});
async function setRpcClientState(state, showTimestamp, largeImageKey) {
    rpc.setActivity({
        state: state,
        startTimestamp: showTimestamp ? new Date().getTime() : undefined,
        largeImageKey: largeImageKey,
    });
}
exports.setRpcClientState = setRpcClientState;
rpc.login({ clientId: "896414550889492511" });
