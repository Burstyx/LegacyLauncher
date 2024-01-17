import getAppDataPath from "appdata-path";
import { app } from "@electron/remote";
import path from "path";

export const minecraftFolder = path.join(app.getPath("appData"), ".riftenrp");
export const devMode = false; //TODO METTRE devMode A FALSE AVANT PUBLICATION

//Microsoft links
export const MS_OAUTH2_URL = "https://login.live.com/oauth20_authorize.srf";
export const MS_OAUTH2_ACCESS_TOKEN =
  "https://login.live.com/oauth20_token.srf";
export const XBL_AUTHENTICATE =
  "https://user.auth.xboxlive.com/user/authenticate";
export const XBL_LOGIN =
  "https://api.minecraftservices.com/authentication/login_with_xbox";
export const XSTS_AUTHENTICATE =
  "https://xsts.auth.xboxlive.com/xsts/authorize";
export const API_ENTITLEMENTS_URL =
  "https://api.minecraftservices.com/entitlements/mcstore";
export const API_PROFILE_URL =
  "https://api.minecraftservices.com/minecraft/profile";

export const CLIENT_ID = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1";

export const REDIRECT_URI =
  "https://login.microsoftonline.com/common/oauth2/nativeclient";