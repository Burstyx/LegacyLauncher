"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIRECT_URI = exports.CLIENT_ID = exports.API_PROFILE_URL = exports.API_ENTITLEMENTS_URL = exports.XSTS_AUTHENTICATE = exports.XBL_LOGIN = exports.XBL_AUTHENTICATE = exports.MS_OAUTH2_ACCESS_TOKEN = exports.MS_OAUTH2_URL = exports.devMode = exports.minecraftFolder = void 0;
const remote_1 = require("@electron/remote");
const path_1 = __importDefault(require("path"));
exports.minecraftFolder = path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp");
exports.devMode = false; //TODO METTRE devMode A FALSE AVANT PUBLICATION
//Microsoft links
exports.MS_OAUTH2_URL = "https://login.live.com/oauth20_authorize.srf";
exports.MS_OAUTH2_ACCESS_TOKEN = "https://login.live.com/oauth20_token.srf";
exports.XBL_AUTHENTICATE = "https://user.auth.xboxlive.com/user/authenticate";
exports.XBL_LOGIN = "https://api.minecraftservices.com/authentication/login_with_xbox";
exports.XSTS_AUTHENTICATE = "https://xsts.auth.xboxlive.com/xsts/authorize";
exports.API_ENTITLEMENTS_URL = "https://api.minecraftservices.com/entitlements/mcstore";
exports.API_PROFILE_URL = "https://api.minecraftservices.com/minecraft/profile";
exports.CLIENT_ID = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1";
exports.REDIRECT_URI = "https://login.microsoftonline.com/common/oauth2/nativeclient";
