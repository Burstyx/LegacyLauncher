import {
  MS_OAUTH2_URL,
  CLIENT_ID,
  REDIRECT_URI,
  MS_OAUTH2_ACCESS_TOKEN,
  XBL_AUTHENTICATE,
  XSTS_AUTHENTICATE,
  XBL_LOGIN,
  API_ENTITLEMENTS_URL,
  API_PROFILE_URL,
} from "../Constants";
import { addAccountStorage, microsoftLogin } from "./AccountsManager";
import fs from "fs";
import path from "path";
import remote, { ipcMain } from "@electron/remote";

export function getOAuth2Url() {
  var url = MS_OAUTH2_URL;
  url += "?client_id=" + CLIENT_ID;
  url += "&response_type=" + "code";
  url += "&redirect_uri=" + REDIRECT_URI;
  url += "&scope=XboxLive.signin%20offline_access";

  return url;
}

export function getMicrosoftAccessToken(code: string) {
  return new Promise((resolve, reject) => {
    console.log(code);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", CLIENT_ID);
    urlencoded.append("code", code);
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("redirect_uri", REDIRECT_URI);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    //@ts-ignore
    fetch(MS_OAUTH2_ACCESS_TOKEN, requestOptions)
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export function getRefreshedMicrosoftToken(refresh_token: string) {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", CLIENT_ID);
    urlencoded.append("refresh_token", refresh_token);
    urlencoded.append("grant_type", "refresh_token");
    urlencoded.append("redirect_uri", REDIRECT_URI);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    //@ts-ignore
    fetch(MS_OAUTH2_ACCESS_TOKEN, requestOptions)
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export async function refreshMinecraftToken(
  refresh_token: string,
  profileFile: any,
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement
) {
  var refreshedMicrosoftToken: string;
  var newRefreshMicrosoftToken: string;
  await getRefreshedMicrosoftToken(refresh_token).then((res) => {
    //@ts-ignore
    refreshedMicrosoftToken = JSON.parse(res)["access_token"];
    //@ts-ignore
    newRefreshMicrosoftToken = JSON.parse(res)["refresh_token"];
  });

  console.log("Connexion à XBL");

  var xblAccessToken: string;
  var xblUHS: string;
  var xstsToken: string;
  var minecraftResfreshedToken: string;
  var token_expiration: number;
  var username: string;
  var uuid: string;
  await getXblInfo(refreshedMicrosoftToken!)
    .then((res) => {
      //@ts-ignore
      xblAccessToken = JSON.parse(res)["Token"];
      //@ts-ignore
      xblUHS = JSON.parse(res)["DisplayClaims"]["xui"][0]["uhs"];
    })
    .catch(async (err) => {
      for (const uuid in profileFile["accounts"]) {
        delete profileFile["accounts"][uuid];
        fs.writeFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json"),
          JSON.stringify(profileFile)
        );
      }
      microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
      return;
    });

  console.log("Connexion à XSTS");

  await getXSTSInfo(xblAccessToken!)
    .then((res) => {
      //@ts-ignore
      xstsToken = JSON.parse(res)["Token"];
    })
    .catch(async (err) => {
      for (const uuid in profileFile["accounts"]) {
        delete profileFile["accounts"][uuid];
        fs.writeFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json"),
          JSON.stringify(profileFile)
        );
      }
      microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
      return;
    });

  console.log("Connexion à Minecraft");

  await getMinecraftToken(xblUHS!, xstsToken!)
    .then((res) => {
      //@ts-ignore
      minecraftResfreshedToken = JSON.parse(res)["access_token"];
      //@ts-ignore
      token_expiration = JSON.parse(res)["expires_in"];
    })
    .catch(async (err) => {
      for (const uuid in profileFile["accounts"]) {
        delete profileFile["accounts"][uuid];
        fs.writeFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json"),
          JSON.stringify(profileFile)
        );
      }
      microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
      return;
    });

  console.log("Vérification de la license");

  await gameOwnership(minecraftResfreshedToken!)
    .then(async (res) => {
      //@ts-ignore
      var itemsCount: int;
      //@ts-ignore
      for (const element in JSON.parse(res)["items"]) {
        itemsCount++;
      }

      if (itemsCount === 0) {
        console.log("Il n'a pas le jeu");
        // micro;
      } else {
        console.log("il a le jeu");
        await getProfile(minecraftResfreshedToken)
          .then((res) => {
            //@ts-ignore
            username = JSON.parse(res)["name"];
          })
          .catch((err) => {
            for (const uuid in profileFile["accounts"]) {
              delete profileFile["accounts"][uuid];
              fs.writeFileSync(
                path.join(
                  remote.app.getPath("appData"),
                  ".riftenrp",
                  "profile.json"
                ),
                JSON.stringify(profileFile)
              );
            }
            microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
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
              fs.writeFileSync(
                path.join(
                  remote.app.getPath("appData"),
                  ".riftenrp",
                  "profile.json"
                ),
                JSON.stringify(profileFile)
              );
            }
            microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
            return;
          });
        addAccountStorage(
          uuid,
          username,
          "Microsoft",
          minecraftResfreshedToken,
          newRefreshMicrosoftToken,
          resX,
          resY,
          fullscreen,
          ram,
          ramIndicator
        );
        console.log("Le token a été rafraichi avec succès");

        return true;
      }
    })
    .catch((err) => {
      for (const uuid in profileFile["accounts"]) {
        delete profileFile["accounts"][uuid];
        fs.writeFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json"),
          JSON.stringify(profileFile)
        );
      }
      microsoftLogin(resX, resY, fullscreen, ram, ramIndicator);
      return;
    });
}

export function getXblInfo(microsoftAccessToken: string) {
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
    fetch(XBL_AUTHENTICATE, requestOptions)
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export function getXSTSInfo(xblToken: string) {
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
    fetch(XSTS_AUTHENTICATE, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (JSON.parse(result)["XErr"] == 2148916238) {
          ipcMain.emit(
            "errorOccured",
            "Vous devez sélectionner un compte Microsoft de plus de 18 ans",
            true
          );
        } else {
          resolve(result);
        }
      })
      .catch((error) => reject(error));
  });
}

export function getMinecraftToken(uhs: string, xstsToken: string) {
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

    fetch(
      XBL_LOGIN,
      //@ts-ignore
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export function gameOwnership(minecraftAccessToken: string) {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + minecraftAccessToken);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      API_ENTITLEMENTS_URL,
      //@ts-ignore
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export function getProfile(minecraftAccessToken: string) {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + minecraftAccessToken);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    //@ts-ignore
    fetch(API_PROFILE_URL, requestOptions)
      .then((response) => response.text())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export function getUuidByUsername(username: string) {
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
