"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.microsoftLogin = exports.isMaintenanceWhitelisted = exports.addAccountStorage = exports.createProfileFile = exports.isAccountBanned = void 0;
const remote_1 = require("@electron/remote");
const is_online_1 = __importDefault(require("is-online"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const Constants_1 = require("../Constants");
const MicrosoftManager_1 = require("./MicrosoftManager");
const LauncherManager_1 = require("./LauncherManager");
const sftp = new ssh2_sftp_client_1.default();
async function isAccountBanned(dataObjTemp, uuid) {
    console.log("Vérification de l'état du compte");
    if (await (0, is_online_1.default)()) {
        if (uuid != undefined) {
            console.log("uuid spécifié");
            for (const i in dataObjTemp["BannedPlayers"]) {
                console.log("Vérification du compte ayant l'uuid " + i);
                if (uuid === i) {
                    //TODO Joueur banni
                    console.log("Vous êtes banni !");
                    return true;
                }
            }
            return false;
        }
        else {
            console.log("pas d'uuid spécifié !");
            if (fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp/profile.json"))) {
                let dataObj;
                if (fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp/profile.json"))) {
                    dataObj = JSON.parse(fs_1.default
                        .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp/profile.json"))
                        .toString());
                }
                for (const element in dataObj["accounts"]) {
                    if (dataObj["accounts"][element]["current"] === true) {
                        for (const i in dataObjTemp["BannedPlayers"]) {
                            if (element === dataObjTemp["BannedPlayers"][i]) {
                                //TODO Joeuur banni
                                console.log("Vous êtes banni !");
                                return true;
                            }
                        }
                        return false;
                    }
                }
                return false;
            }
        }
    }
    else {
        //TODO Pas de connexion internet
    }
}
exports.isAccountBanned = isAccountBanned;
function createProfileFile(resX, resY, fullscreen, ram, ramIndicator) {
    if (!fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))) {
        if (!fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp")))
            fs_1.default.mkdirSync(Constants_1.minecraftFolder);
        fs_1.default.writeFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify({
            accounts: {},
            settings: {
                ram: "2048",
                resolutionX: "854",
                resolutionY: "480",
                fullscreen: false,
            },
        }));
        (0, LauncherManager_1.refreshSettingsMenu)(resX, resY, fullscreen, ram, ramIndicator);
    }
}
exports.createProfileFile = createProfileFile;
function addAccountStorage(uuid, username, accountType, mcToken, refreshToken, resX, resY, fullscreen, ram, ramIndicator) {
    if (!fs_1.default.existsSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json")) {
        createProfileFile(resX, resY, fullscreen, ram, ramIndicator);
    }
    try {
        const data = fs_1.default.readFileSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json");
        let dataObj = JSON.parse(data.toString());
        dataObj["accounts"][uuid] = {};
        dataObj["accounts"][uuid]["type"] = accountType;
        dataObj["accounts"][uuid]["skinUrl"] =
            "https://mc-heads.net/avatar/" + uuid;
        dataObj["accounts"][uuid]["expireAt"] = new Date().getTime() + 86400000;
        dataObj["accounts"][uuid]["userName"] = username;
        dataObj["accounts"][uuid]["mcToken"] = mcToken;
        dataObj["accounts"][uuid]["refreshToken"] = refreshToken;
        dataObj["accounts"][uuid]["uuid"] = uuid;
        let dataString = JSON.stringify(dataObj, null, 4);
        fs_1.default.writeFileSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json", dataString);
    }
    catch (e) {
        console.log(e);
    }
}
exports.addAccountStorage = addAccountStorage;
async function isMaintenanceWhitelisted(dataObjTemp) {
    let dataObjProfile;
    await sftp.get("/home/riftenlauncher/info.json", fs_1.default.createWriteStream(path_1.default.join(remote_1.app.getPath("temp"), "temp.json")));
    if (fs_1.default.existsSync(path_1.default.join(Constants_1.minecraftFolder, "profile.json"))) {
        dataObjProfile = JSON.parse(fs_1.default
            .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp/profile.json"))
            .toString());
        dataObjTemp = JSON.parse(fs_1.default.readFileSync(path_1.default.join(remote_1.app.getPath("temp"), "temp.json")).toString());
        for (const element in dataObjProfile["accounts"]) {
            if (dataObjProfile["accounts"][element]["current"] == true) {
                for (const i in dataObjTemp["whitelistedPlayers"]) {
                    if (element === dataObjTemp["whitelistedPlayers"][i]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        }
    }
    else {
        return false;
    }
}
exports.isMaintenanceWhitelisted = isMaintenanceWhitelisted;
var code;
var microsoftAccessToken;
var microsoftRefreshToken;
var xblAccessToken;
var xblUHS;
var xstsToken;
var minecraftAccessToken;
var token_expiration;
var username;
var uuid;
async function microsoftLogin(resX, resY, fullscreen, ram, ramIndicator) {
    return await new Promise(async (resolve, reject) => {
        const microsoftWindow = new remote_1.BrowserWindow({
            width: 488,
            height: 511,
            center: true,
            fullscreenable: false,
        });
        await microsoftWindow.webContents.session.clearStorageData();
        microsoftWindow.setMenu(null);
        microsoftWindow.loadURL((0, MicrosoftManager_1.getOAuth2Url)());
        console.log(microsoftWindow.webContents.getURL());
        console.log(microsoftWindow.webContents.getURL());
        microsoftWindow.on("close", () => {
            remote_1.ipcMain.emit("loadingSomething", "", false);
        });
        microsoftWindow.webContents.on("update-target-url", async (evt, url) => {
            if (microsoftWindow.webContents.getURL().includes(Constants_1.REDIRECT_URI + "?code=")) {
                //Récupération du code d'autorisation
                code = new URL(microsoftWindow.webContents.getURL()).searchParams.get("code");
                microsoftWindow.hide();
                console.log("Connexion au compte Microsoft");
                await (0, MicrosoftManager_1.getMicrosoftAccessToken)(code)
                    .then((res) => {
                    //@ts-ignore
                    microsoftAccessToken = JSON.parse(res)["access_token"];
                    //@ts-ignore
                    microsoftRefreshToken = JSON.parse(res)["refresh_token"];
                })
                    .catch((err) => {
                    microsoftWindow.close();
                    remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth001")', true);
                    reject(err);
                    return;
                });
                console.log("Connexion à XBL");
                await (0, MicrosoftManager_1.getXblInfo)(microsoftAccessToken)
                    .then((res) => {
                    //@ts-ignore
                    xblAccessToken = JSON.parse(res)["Token"];
                    //@ts-ignore
                    xblUHS = JSON.parse(res)["DisplayClaims"]["xui"][0]["uhs"];
                    console.log("uhs " + xblUHS);
                })
                    .catch((err) => {
                    microsoftWindow.close();
                    remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth002")', true);
                    reject(err);
                    return;
                });
                console.log("Connexion à XSTS");
                await (0, MicrosoftManager_1.getXSTSInfo)(xblAccessToken)
                    .then((res) => {
                    //@ts-ignore
                    xstsToken = JSON.parse(res)["Token"];
                    console.log("xsts " + xstsToken);
                })
                    .catch((err) => {
                    microsoftWindow.close();
                    remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth003")', true);
                    reject(err);
                    return;
                    //TODO Gérer erreur possible, voir : https://wiki.vg/Microsoft_Authentication_Scheme
                });
                console.log("Connexion à Minecraft");
                await (0, MicrosoftManager_1.getMinecraftToken)(xblUHS, xstsToken)
                    .then((res) => {
                    //@ts-ignore
                    minecraftAccessToken = JSON.parse(res)["access_token"];
                    //@ts-ignore
                    token_expiration = JSON.parse(res)["expires_in"];
                    console.log(token_expiration);
                })
                    .catch((err) => {
                    microsoftWindow.close();
                    remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth004")', true);
                    reject(err);
                    return;
                });
                console.log("Vérification de la license");
                await (0, MicrosoftManager_1.gameOwnership)(minecraftAccessToken)
                    .then(async (res) => {
                    //@ts-ignore
                    var itemsCount;
                    //@ts-ignore
                    for (const element in JSON.parse(res)["items"]) {
                        itemsCount++;
                    }
                    if (itemsCount === 0) {
                        console.log("Il n'a pas le jeu");
                        microsoftWindow.close();
                        resolve(false);
                        return;
                    }
                    else {
                        console.log("il a le jeu");
                        await (0, MicrosoftManager_1.getProfile)(minecraftAccessToken)
                            .then((res) => {
                            //@ts-ignore
                            username = JSON.parse(res)["name"];
                            console.log(username);
                        })
                            .catch((err) => {
                            microsoftWindow.close();
                            remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth006")', true);
                            reject(err);
                            return;
                        });
                        await (0, MicrosoftManager_1.getUuidByUsername)(username)
                            .then((res) => {
                            //@ts-ignore
                            console.log(res);
                            //@ts-ignore
                            uuid = JSON.parse(res)[0]["id"];
                            console.log(uuid);
                        })
                            .catch((err) => {
                            microsoftWindow.close();
                            remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth007")', true);
                            reject(err);
                            return;
                        });
                        addAccountStorage(uuid, username, "Microsoft", minecraftAccessToken, microsoftRefreshToken, resX, resY, fullscreen, ram, ramIndicator);
                        microsoftWindow.close();
                        resolve(true);
                        return;
                    }
                })
                    .catch((err) => {
                    microsoftWindow.close();
                    remote_1.ipcMain.emit("errorOccured", 'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth005")', true);
                    reject(err);
                    return;
                });
            }
        });
    });
}
exports.microsoftLogin = microsoftLogin;
