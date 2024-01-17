import { app } from "@electron/remote";
import { minecraftFolder } from "../Constants";
import path from "path";
import fs from "fs";
import Client from "ssh2-sftp-client";
import ChildProcess from "child_process";
import { createProfileFile } from "./AccountsManager";

const sftp = new Client();

export async function inMaintenance(dataObjTemp: any) {
  if (fs.existsSync(path.join(minecraftFolder, "profile.json"))) {
    let dataObjProfile;
    dataObjProfile = JSON.parse(
      fs
        .readFileSync(
          path.join(app.getPath("appData"), ".riftenrp/profile.json")
        )
        .toString()
    );
    if (dataObjTemp["maintenance"] == true) {
      console.log("maintenance activé");
      return true;
    } else {
      console.log("maintenance désactivé");

      return false;
    }
  } else {
    if (dataObjTemp["maintenance"] == true) {
      console.log("maintenance activé");

      return true;
    } else {
      console.log("maintenance désactivé");

      return false;
    }
  }
}

export async function updateLauncher(dataObjInfo: any, packageJson: any) {
  if (dataObjInfo["version"] == packageJson["version"]) {
    console.log("aucune mise à jour trouvé !");
    return false;
  } else {
    console.log("mise à jour trouvé !");

    console.log("téléchargement de la mise à jour");
    console.log("démarrage de la mise à jour");
    var result = ChildProcess.exec(
      path.join(app.getPath("temp"), "riftensetup-temp.exe"),
      function (err, data) {
        console.log(err);
        console.log(data.toString());
      }
    );
    console.log("mise à jour terminé");

    result.on("close", () => {
      app.quit();
    });

    return true;
  }
}

export function updateSettings(
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement,
  ramVal?: string,
  resXVal?: string,
  resYVal?: string,
  fullscreenVal?: boolean
) {
  if (!fs.existsSync(app.getPath("appData") + "\\.riftenrp\\profile.json")) {
    createProfileFile(resX, resY, fullscreen, ram, ramIndicator);
  }
  const dataStr = JSON.parse(
    fs
      .readFileSync(
        path.join(app.getPath("appData"), ".riftenrp", "profile.json")
      )
      .toString("utf-8")
  );
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
  fs.writeFileSync(
    app.getPath("appData") + "\\.riftenrp\\profile.json",
    dataString
  );
}

export function refreshSettingsMenu(
  resX: HTMLElement,
  resY: HTMLElement,
  fullscreen: HTMLElement,
  ram: HTMLElement,
  ramIndicator: HTMLElement
) {
  if (
    fs.existsSync(
      path.join(app.getPath("appData"), ".riftenrp", "profile.json")
    )
  ) {
    const dataStr = JSON.parse(
      fs
        .readFileSync(
          path.join(app.getPath("appData"), ".riftenrp", "profile.json")
        )
        .toString("utf-8")
    );

    //@ts-ignore
    resX.value = dataStr["settings"]["resolutionX"];
    //@ts-ignore
    resY.value = dataStr["settings"]["resolutionY"];
    //@ts-ignore
    fullscreen.checked = dataStr["settings"]["fullscreen"];
    //@ts-ignore
    ram.value = dataStr["settings"]["ram"];
    ramIndicator!.innerHTML =
      "Alloué actuellement : " + dataStr["settings"]["ram"] + "Go";
  }
}
