"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSettingsMenu = exports.updateSettings = exports.updateLauncher = exports.inMaintenance = void 0;
const remote_1 = require("@electron/remote");
const Constants_1 = require("../Constants");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const child_process_1 = __importDefault(require("child_process"));
const AccountsManager_1 = require("./AccountsManager");
const sftp = new ssh2_sftp_client_1.default();
async function inMaintenance(dataObjTemp) {
    if (fs_1.default.existsSync(path_1.default.join(Constants_1.minecraftFolder, "profile.json"))) {
        let dataObjProfile;
        dataObjProfile = JSON.parse(fs_1.default
            .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp/profile.json"))
            .toString());
        if (dataObjTemp["maintenance"] == true) {
            console.log("maintenance activé");
            return true;
        }
        else {
            console.log("maintenance désactivé");
            return false;
        }
    }
    else {
        if (dataObjTemp["maintenance"] == true) {
            console.log("maintenance activé");
            return true;
        }
        else {
            console.log("maintenance désactivé");
            return false;
        }
    }
}
exports.inMaintenance = inMaintenance;
async function updateLauncher(dataObjInfo, packageJson) {
    if (dataObjInfo["version"] == packageJson["version"]) {
        console.log("aucune mise à jour trouvé !");
        return false;
    }
    else {
        console.log("mise à jour trouvé !");
        console.log("téléchargement de la mise à jour");
        console.log("démarrage de la mise à jour");
        var result = child_process_1.default.exec(path_1.default.join(remote_1.app.getPath("temp"), "riftensetup-temp.exe"), function (err, data) {
            console.log(err);
            console.log(data.toString());
        });
        console.log("mise à jour terminé");
        result.on("close", () => {
            remote_1.app.quit();
        });
        return true;
    }
}
exports.updateLauncher = updateLauncher;
function updateSettings(resX, resY, fullscreen, ram, ramIndicator, ramVal, resXVal, resYVal, fullscreenVal) {
    if (!fs_1.default.existsSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json")) {
        (0, AccountsManager_1.createProfileFile)(resX, resY, fullscreen, ram, ramIndicator);
    }
    const dataStr = JSON.parse(fs_1.default
        .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))
        .toString("utf-8"));
    dataStr["settings"]["ram"] =
        ramVal == undefined ? dataStr["settings"]["ram"] : ramVal;
    dataStr["settings"]["resolutionX"] =
        resXVal == undefined ? dataStr["settings"]["resolutionX"] : resXVal;
    dataStr["settings"]["resolutionY"] =
        resYVal == undefined ? dataStr["settings"]["resolutionY"] : resYVal;
    dataStr["settings"]["fullscreen"] =
        fullscreenVal == undefined
            ? dataStr["settings"]["fullscreen"]
            : fullscreenVal;
    let dataString = JSON.stringify(dataStr, null, 4);
    fs_1.default.writeFileSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json", dataString);
}
exports.updateSettings = updateSettings;
function refreshSettingsMenu(resX, resY, fullscreen, ram, ramIndicator) {
    if (fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))) {
        const dataStr = JSON.parse(fs_1.default
            .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))
            .toString("utf-8"));
        //@ts-ignore
        resX.value = dataStr["settings"]["resolutionX"];
        //@ts-ignore
        resY.value = dataStr["settings"]["resolutionY"];
        //@ts-ignore
        fullscreen.checked = dataStr["settings"]["fullscreen"];
        //@ts-ignore
        ram.value = dataStr["settings"]["ram"];
        ramIndicator.innerHTML =
            "Alloué actuellement : " + dataStr["settings"]["ram"] + "Go";
    }
}
exports.refreshSettingsMenu = refreshSettingsMenu;
