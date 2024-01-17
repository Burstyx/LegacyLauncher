import { app, BrowserWindow, ipcMain } from "@electron/remote";
import IsOnline from "is-online";
import path from "path";
import fs from "fs";
import Client from "ssh2-sftp-client";
import { minecraftFolder, REDIRECT_URI } from "../Constants";
import {
  gameOwnership,
  getMicrosoftAccessToken,
  getMinecraftToken,
  getOAuth2Url,
  getProfile,
  getUuidByUsername,
  getXblInfo,
  getXSTSInfo,
} from "./MicrosoftManager";
import { refreshSettingsMenu } from "./LauncherManager";

const sftp = new Client();

export async function isAccountBanned(dataObjTemp: any, uuid?: any) {
  console.log("Vérification de l'état du compte");

  if (await IsOnline()) {
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
    } else {
      console.log("pas d'uuid spécifié !");

      if (
        fs.existsSync(
          path.join(app.getPath("appData"), ".riftenrp/profile.json")
        )
      ) {
        let dataObj;
        if (
          fs.existsSync(
            path.join(app.getPath("appData"), ".riftenrp/profile.json")
          )
        ) {
          dataObj = JSON.parse(
            fs
              .readFileSync(
                path.join(app.getPath("appData"), ".riftenrp/profile.json")
              )
              .toString()
          );
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
  } else {
    //TODO Pas de connexion internet
  }
}

export function createProfileFile(
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement
) {
  if (
    !fs.existsSync(
      path.join(app.getPath("appData"), ".riftenrp", "profile.json")
    )
  ) {
    if (!fs.existsSync(path.join(app.getPath("appData"), ".riftenrp")))
      fs.mkdirSync(minecraftFolder);
    fs.writeFileSync(
      path.join(app.getPath("appData"), ".riftenrp", "profile.json"),
      JSON.stringify({
        accounts: {},
        settings: {
          ram: "2048",
          resolutionX: "854",
          resolutionY: "480",
          fullscreen: false,
        },
      })
    );
    refreshSettingsMenu(resX, resY, fullscreen, ram, ramIndicator);
  }
}

export function addAccountStorage(
  uuid: any,
  username: string,
  accountType: any,
  mcToken: string,
  refreshToken: string,
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement
) {
  if (!fs.existsSync(app.getPath("appData") + "\\.riftenrp\\profile.json")) {
    createProfileFile(resX, resY, fullscreen, ram, ramIndicator);
  }
  try {
    const data = fs.readFileSync(
      app.getPath("appData") + "\\.riftenrp\\profile.json"
    );
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
    fs.writeFileSync(
      app.getPath("appData") + "\\.riftenrp\\profile.json",
      dataString
    );
  } catch (e) {
    console.log(e);
  }
}

export async function isMaintenanceWhitelisted(dataObjTemp: any) {
  let dataObjProfile;
  await sftp.get(
    "/home/riftenlauncher/info.json",
    fs.createWriteStream(path.join(app.getPath("temp"), "temp.json"))
  );

  if (fs.existsSync(path.join(minecraftFolder, "profile.json"))) {
    dataObjProfile = JSON.parse(
      fs
        .readFileSync(
          path.join(app.getPath("appData"), ".riftenrp/profile.json")
        )
        .toString()
    );

    dataObjTemp = JSON.parse(
      fs.readFileSync(path.join(app.getPath("temp"), "temp.json")).toString()
    );

    for (const element in dataObjProfile["accounts"]) {
      if (dataObjProfile["accounts"][element]["current"] == true) {
        for (const i in dataObjTemp["whitelistedPlayers"]) {
          if (element === dataObjTemp["whitelistedPlayers"][i]) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  } else {
    return false;
  }
}

var code: string;
var microsoftAccessToken: string;
var microsoftRefreshToken: string;
var xblAccessToken: string;
var xblUHS: string;
var xstsToken: string;
var minecraftAccessToken: string;
var token_expiration: number;
var username: string;
var uuid: string;

export async function microsoftLogin(
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement
) {
  return await new Promise(async (resolve, reject) => {
    const microsoftWindow = new BrowserWindow({
      width: 488,
      height: 511,
      center: true,
      fullscreenable: false,
    });

    await microsoftWindow.webContents.session.clearStorageData();
    microsoftWindow.setMenu(null);
    microsoftWindow.loadURL(getOAuth2Url());

    console.log(microsoftWindow.webContents.getURL());
    console.log(microsoftWindow.webContents.getURL());

    microsoftWindow.on("close", () => {
      ipcMain.emit("loadingSomething", "", false);
    });

    microsoftWindow.webContents.on("update-target-url", async (evt, url) => {
      if (
        microsoftWindow.webContents.getURL().includes(REDIRECT_URI + "?code=")
      ) {
        //Récupération du code d'autorisation
        code = new URL(microsoftWindow.webContents.getURL()).searchParams.get(
          "code"
        )!;

        microsoftWindow.hide();

        console.log("Connexion au compte Microsoft");

        await getMicrosoftAccessToken(code)
          .then((res) => {
            //@ts-ignore
            microsoftAccessToken = JSON.parse(res)["access_token"];
            //@ts-ignore
            microsoftRefreshToken = JSON.parse(res)["refresh_token"];
          })
          .catch((err) => {
            microsoftWindow.close();
            ipcMain.emit(
              "errorOccured",
              'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth001")',
              true
            );
            reject(err);
            return;
          });

        console.log("Connexion à XBL");

        await getXblInfo(microsoftAccessToken)
          .then((res) => {
            //@ts-ignore
            xblAccessToken = JSON.parse(res)["Token"];
            //@ts-ignore
            xblUHS = JSON.parse(res)["DisplayClaims"]["xui"][0]["uhs"];
            console.log("uhs " + xblUHS);
          })
          .catch((err) => {
            microsoftWindow.close();
            ipcMain.emit(
              "errorOccured",
              'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth002")',
              true
            );
            reject(err);
            return;
          });

        console.log("Connexion à XSTS");

        await getXSTSInfo(xblAccessToken)
          .then((res) => {
            //@ts-ignore
            xstsToken = JSON.parse(res)["Token"];
            console.log("xsts " + xstsToken);
          })
          .catch((err) => {
            microsoftWindow.close();
            ipcMain.emit(
              "errorOccured",
              'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth003")',
              true
            );
            reject(err);
            return;

            //TODO Gérer erreur possible, voir : https://wiki.vg/Microsoft_Authentication_Scheme
          });

        console.log("Connexion à Minecraft");

        await getMinecraftToken(xblUHS, xstsToken)
          .then((res) => {
            //@ts-ignore
            minecraftAccessToken = JSON.parse(res)["access_token"];
            //@ts-ignore
            token_expiration = JSON.parse(res)["expires_in"];
            console.log(token_expiration);
          })
          .catch((err) => {
            microsoftWindow.close();
            ipcMain.emit(
              "errorOccured",
              'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth004")',
              true
            );
            reject(err);
            return;
          });

        console.log("Vérification de la license");

        await gameOwnership(minecraftAccessToken)
          .then(async (res) => {
            //@ts-ignore
            var itemsCount: int;
            //@ts-ignore
            for (const element in JSON.parse(res)["items"]) {
              itemsCount++;
            }

            if (itemsCount === 0) {
              console.log("Il n'a pas le jeu");
              microsoftWindow.close();
              resolve(false);
              return;
            } else {
              console.log("il a le jeu");
              await getProfile(minecraftAccessToken)
                .then((res) => {
                  //@ts-ignore
                  username = JSON.parse(res)["name"];
                  console.log(username);
                })
                .catch((err) => {
                  microsoftWindow.close();
                  ipcMain.emit(
                    "errorOccured",
                    'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth006")',
                    true
                  );
                  reject(err);
                  return;
                });

              await getUuidByUsername(username)
                .then((res) => {
                  //@ts-ignore
                  console.log(res);
                  //@ts-ignore
                  uuid = JSON.parse(res)[0]["id"];
                  console.log(uuid);
                })
                .catch((err) => {
                  microsoftWindow.close();
                  ipcMain.emit(
                    "errorOccured",
                    'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth007")',
                    true
                  );
                  reject(err);
                  return;
                });
              addAccountStorage(
                uuid,
                username,
                "Microsoft",
                minecraftAccessToken,
                microsoftRefreshToken,
                resX,
                resY,
                fullscreen,
                ram,
                ramIndicator
              );
              microsoftWindow.close();
              resolve(true);
              return;
            }
          })
          .catch((err) => {
            microsoftWindow.close();
            ipcMain.emit(
              "errorOccured",
              'Oh oh... Impossible de vous connecter à votre compte microsoft (code erreur : "auth005")',
              true
            );
            reject(err);
            return;
          });
      }
    });
  });
}
