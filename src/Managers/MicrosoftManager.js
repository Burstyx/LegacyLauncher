"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUuidByUsername = exports.getProfile = exports.gameOwnership = exports.getMinecraftToken = exports.getXSTSInfo = exports.getXblInfo = exports.refreshMinecraftToken = exports.getRefreshedMicrosoftToken = exports.getMicrosoftAccessToken = exports.getOAuth2Url = void 0;
const Constants_1 = require("../Constants");
const AccountsManager_1 = require("./AccountsManager");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const remote_1 = __importStar(require("@electron/remote"));
function getOAuth2Url() {
    var url = Constants_1.MS_OAUTH2_URL;
    url += "?client_id=" + Constants_1.CLIENT_ID;
    url += "&response_type=" + "code";
    url += "&redirect_uri=" + Constants_1.REDIRECT_URI;
    url += "&scope=XboxLive.signin%20offline_access";
    return url;
}
exports.getOAuth2Url = getOAuth2Url;
function getMicrosoftAccessToken(code) {
    return new Promise((resolve, reject) => {
        console.log(code);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", Constants_1.CLIENT_ID);
        urlencoded.append("code", code);
        urlencoded.append("grant_type", "authorization_code");
        urlencoded.append("redirect_uri", Constants_1.REDIRECT_URI);
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow",
        };
        //@ts-ignore
        fetch(Constants_1.MS_OAUTH2_ACCESS_TOKEN, requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getMicrosoftAccessToken = getMicrosoftAccessToken;
function getRefreshedMicrosoftToken(refresh_token) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", Constants_1.CLIENT_ID);
        urlencoded.append("refresh_token", refresh_token);
        urlencoded.append("grant_type", "refresh_token");
        urlencoded.append("redirect_uri", Constants_1.REDIRECT_URI);
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow",
        };
        //@ts-ignore
        fetch(Constants_1.MS_OAUTH2_ACCESS_TOKEN, requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getRefreshedMicrosoftToken = getRefreshedMicrosoftToken;
async function refreshMinecraftToken(refresh_token, profileFile, resX, resY, fullscreen, ram, ramIndicator) {
    var refreshedMicrosoftToken;
    var newRefreshMicrosoftToken;
    await getRefreshedMicrosoftToken(refresh_token).then((res) => {
        //@ts-ignore
        refreshedMicrosoftToken = JSON.parse(res)["access_token"];
        //@ts-ignore
        newRefreshMicrosoftToken = JSON.parse(res)["refresh_token"];
    });
    console.log("Connexion à XBL");
    var xblAccessToken;
    var xblUHS;
    var xstsToken;
    var minecraftResfreshedToken;
    var token_expiration;
    var username;
    var uuid;
    await getXblInfo(refreshedMicrosoftToken)
        .then((res) => {
        //@ts-ignore
        xblAccessToken = JSON.parse(res)["Token"];
        //@ts-ignore
        xblUHS = JSON.parse(res)["DisplayClaims"]["xui"][0]["uhs"];
    })
        .catch(async (err) => {
        for (const uuid in profileFile["accounts"]) {
            delete profileFile["accounts"][uuid];
            fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
        }
        (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
        return;
    });
    console.log("Connexion à XSTS");
    await getXSTSInfo(xblAccessToken)
        .then((res) => {
        //@ts-ignore
        xstsToken = JSON.parse(res)["Token"];
    })
        .catch(async (err) => {
        for (const uuid in profileFile["accounts"]) {
            delete profileFile["accounts"][uuid];
            fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
        }
        (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
        return;
    });
    console.log("Connexion à Minecraft");
    await getMinecraftToken(xblUHS, xstsToken)
        .then((res) => {
        //@ts-ignore
        minecraftResfreshedToken = JSON.parse(res)["access_token"];
        //@ts-ignore
        token_expiration = JSON.parse(res)["expires_in"];
    })
        .catch(async (err) => {
        for (const uuid in profileFile["accounts"]) {
            delete profileFile["accounts"][uuid];
            fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
        }
        (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
        return;
    });
    console.log("Vérification de la license");
    await gameOwnership(minecraftResfreshedToken)
        .then(async (res) => {
        //@ts-ignore
        var itemsCount;
        //@ts-ignore
        for (const element in JSON.parse(res)["items"]) {
            itemsCount++;
        }
        if (itemsCount === 0) {
            console.log("Il n'a pas le jeu");
            // micro;
        }
        else {
            console.log("il a le jeu");
            await getProfile(minecraftResfreshedToken)
                .then((res) => {
                //@ts-ignore
                username = JSON.parse(res)["name"];
            })
                .catch((err) => {
                for (const uuid in profileFile["accounts"]) {
                    delete profileFile["accounts"][uuid];
                    fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
                }
                (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
                return;
            });
            await getUuidByUsername(username)
                .then((res) => {
                //@ts-ignore
                console.log(res);
                //@ts-ignore
                uuid = JSON.parse(res)[0]["id"];
            })
                .catch((err) => {
                for (const uuid in profileFile["accounts"]) {
                    delete profileFile["accounts"][uuid];
                    fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
                }
                (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
                return;
            });
            (0, AccountsManager_1.addAccountStorage)(uuid, username, "Microsoft", minecraftResfreshedToken, newRefreshMicrosoftToken, resX, resY, fullscreen, ram, ramIndicator);
            console.log("Le token a été rafraichi avec succès");
            return true;
        }
    })
        .catch((err) => {
        for (const uuid in profileFile["accounts"]) {
            delete profileFile["accounts"][uuid];
            fs_1.default.writeFileSync(path_1.default.join(remote_1.default.app.getPath("appData"), ".riftenrp", "profile.json"), JSON.stringify(profileFile));
        }
        (0, AccountsManager_1.microsoftLogin)(resX, resY, fullscreen, ram, ramIndicator);
        return;
    });
}
exports.refreshMinecraftToken = refreshMinecraftToken;
function getXblInfo(microsoftAccessToken) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            Properties: {
                AuthMethod: "RPS",
                SiteName: "user.auth.xboxlive.com",
                RpsTicket: "d=" + microsoftAccessToken,
            },
            RelyingParty: "http://auth.xboxlive.com",
            TokenType: "JWT",
        });
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        //@ts-ignore
        fetch(Constants_1.XBL_AUTHENTICATE, requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getXblInfo = getXblInfo;
function getXSTSInfo(xblToken) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            Properties: {
                SandboxId: "RETAIL",
                UserTokens: [xblToken],
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT",
        });
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        //@ts-ignore
        fetch(Constants_1.XSTS_AUTHENTICATE, requestOptions)
            .then((response) => response.text())
            .then((result) => {
            if (JSON.parse(result)["XErr"] == 2148916238) {
                remote_1.ipcMain.emit("errorOccured", "Vous devez sélectionner un compte Microsoft de plus de 18 ans", true);
            }
            else {
                resolve(result);
            }
        })
            .catch((error) => reject(error));
    });
}
exports.getXSTSInfo = getXSTSInfo;
function getMinecraftToken(uhs, xstsToken) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            identityToken: "XBL3.0 x=" + uhs + ";" + xstsToken,
        });
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        fetch(Constants_1.XBL_LOGIN, 
        //@ts-ignore
        requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getMinecraftToken = getMinecraftToken;
function gameOwnership(minecraftAccessToken) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + minecraftAccessToken);
        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };
        fetch(Constants_1.API_ENTITLEMENTS_URL, 
        //@ts-ignore
        requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.gameOwnership = gameOwnership;
function getProfile(minecraftAccessToken) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + minecraftAccessToken);
        var requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };
        //@ts-ignore
        fetch(Constants_1.API_PROFILE_URL, requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getProfile = getProfile;
function getUuidByUsername(username) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify([username]);
        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        //@ts-ignore
        fetch("https://api.mojang.com/profiles/minecraft", requestOptions)
            .then((response) => response.text())
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
}
exports.getUuidByUsername = getUuidByUsername;
