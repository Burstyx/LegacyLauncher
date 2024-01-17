import getAppDataPath from "appdata-path";
import { app, BrowserWindow } from "@electron/remote";
import path from "path";
import Client from "ssh2-sftp-client";
import fs from "fs";
import {
  getVersionList,
  installDependenciesTask,
  installForgeTask,
  installTask,
} from "@xmcl/installer";
import { downloadHostedFiles, javaDownloader } from "./DownloadManager";
import { launch, Version } from "@xmcl/core";
import { getDefaultFrame, KeyCode, stringify } from "@xmcl/gamesetting";
import { GameProfile, offline } from "@xmcl/user";
import { minecraftFolder } from "../Constants";
import { setRpcClientState } from "./DiscordRpcManager";
import ChildProcess from "child_process";
import { ipcMain } from "@electron/remote";
import { createProfileFile } from "./AccountsManager";
import { getProfile, refreshMinecraftToken } from "./MicrosoftManager";

const sftp = new Client();
var game: ChildProcess.ChildProcess;
var window = BrowserWindow.getFocusedWindow();

export async function startMinecraft(
  progressBar: HTMLElement,
  downloadStatus: HTMLElement,
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
    let dataObj = JSON.parse(
      fs
        .readFileSync(app.getPath("appData") + "\\.riftenrp\\profile.json")
        .toString()
    );

    var account = 0;

    downloadStatus.innerHTML = "Vérification du compte";
    for (const uuid in dataObj["accounts"]) {
      account++;
      console.log("account found");

      if (true) {
        //TODO remplacer "true" par await isAccountBanned(mainWindow)

        try {
          let aVersion;
          const pageMinecraft = (await getVersionList()).versions;
          for (const element in pageMinecraft) {
            if (pageMinecraft[element]["id"] == "1.18.2") {
              aVersion = pageMinecraft[element];
            }
          }

          console.log(aVersion);

          //@ts-ignore
          const procMinecraft = installTask(aVersion, minecraftFolder);

          console.log("install task created");
          

          console.log("downloading minecraft");
          downloadStatus.innerHTML = "Téléchargement de Minecraft";
          window?.setProgressBar(-1);
          await procMinecraft.startAndWait({
            onUpdate(task, chunkSize) {
              //@ts-ignore
              progressBar?.style.width =
                (
                  (100 * procMinecraft.progress) /
                  procMinecraft.total
                ).toString() + "%";

              console.log(
                (100 * procMinecraft.progress) / procMinecraft.total / 100
              );

              window?.setProgressBar(
                (100 * procMinecraft.progress) / procMinecraft.total / 100
              );

              // console.log(
              //   "minecraft: " +
              //     (
              //       (100 * procMinecraft.progress) /
              //       procMinecraft.total
              //     ).toString()
              // );

              console.log("is updating");
              

              if (task.isDone) {
                console.log("terminé");
              }
            },
          });

          console.log("c bon");
          
          const procForge = installForgeTask(
            { mcversion: "1.18.2", version: "40.2.10" },
            minecraftFolder
          );

          console.log("downloading forge");
          window?.setProgressBar(-1);
          downloadStatus.innerHTML = "Téléchargement de Forge";
          await procForge.startAndWait({
            onUpdate(task, chunkSize) {
              //@ts-ignore
              progressBar?.style.width =
                ((100 * procForge.progress) / procForge.total).toString() + "%";

              window?.setProgressBar(
                (100 * procForge.progress) / procForge.total / 100
              );

              console.log(
                "forge: " +
                  ((100 * procForge.progress) / procForge.total).toString()
              );

              if (task.isDone) {
                console.log("terminé");
              }
            },
          });

          console.log("downloading java");
          downloadStatus.innerHTML = "Téléchargement de Java";
          window?.setProgressBar(-1);
          await javaDownloader(minecraftFolder, progressBar);

          const resolvedVersion = await Version.parse(
            minecraftFolder,
            "1.18.2-forge-40.2.10"
          );
          const procDep = installDependenciesTask(resolvedVersion);

          console.log("downloading dependencies");
          downloadStatus.innerHTML = "Vérification des dépendances";
          window?.setProgressBar(-1);
          await procDep.startAndWait({
            onUpdate(task, chunkSize) {
              //@ts-ignore
              progressBar?.style.width =
                ((100 * procDep.progress) / procDep.total).toString() + "%";

              window?.setProgressBar(
                (100 * procDep.progress) / procDep.total / 100
              );

              console.log(
                "dep: " + ((100 * procDep.progress) / procDep.total).toString()
              );

              if (task.isDone) {
                console.log("terminé");
              }
            },
          });

          window?.setProgressBar(-1);
          // if (await downloadHostedFiles()) {
          console.log("launching game");
          downloadStatus.innerHTML = "Lancement du jeu";

          var id: string;
          var name: string;

          await getProfile(dataObj["accounts"][uuid]["mcToken"]).then(
            //@ts-ignore
            (res) => (id = JSON.parse(res)["id"])
          );

          await getProfile(dataObj["accounts"][uuid]["mcToken"]).then(
            //@ts-ignore
            (res) => (name = JSON.parse(res)["name"])
          );

          const gameProfileInfo = {
            name: name!,
            id: id!,
          };

          var profileFile = JSON.parse(
            fs
              .readFileSync(
                path.join(app.getPath("appData"), ".riftenrp", "profile.json")
              )
              .toString("utf-8")
          );

          console.log("vérification de l'état du token");
          console.log(new Date().getTime());
          console.log(profileFile["accounts"][uuid]["expireAt"]);
          if (
            new Date().getTime() >= profileFile["accounts"][uuid]["expireAt"]
          ) {
            console.log("Le token a besoin d'être rafraichi");
            if (profileFile["accounts"][uuid]["type"] == "Microsoft") {
              await refreshMinecraftToken(
                profileFile["accounts"][uuid]["refreshToken"],
                profileFile,
                resX,
                resY,
                fullscreen,
                ram,
                ramIndicator
              );
            }
          } else {
            console.log("Le token est à jour");
          }

          downloadHostedFiles(minecraftFolder);
          game = await launch({
            gameProfile: gameProfileInfo,
            accessToken: dataObj["accounts"][uuid]["mcToken"],
            gamePath: minecraftFolder,
            launcherName: "RiftenRP",
            launcherBrand: "Riften",
            javaPath: path.join(minecraftFolder, "jdk8u312-b07/bin/java.exe"),
            version: "1.18.2-40.2.10",
            maxMemory: Number(parseInt(dataObj["settings"]["ram"])),
            resolution: {
              width: Number(dataObj["settings"]["resolutionX"]),
              height: Number(dataObj["settings"]["resolutionY"]),
            },
          });
          //@ts-ignore
          progressBar?.style.width = "100%";
          downloadStatus.innerHTML = "Le jeu est lancé !";

          await setRpcClientState("En train de jouer à RiftenRP", true, "logo");

          game.stdout?.on("data", (err) => {
            console.log(err.toString());
          });

          game.stderr?.on("data", (err) => {
            console.log(err.toString());
          });

          game.stdout?.on("close", async () => {
            downloadStatus.innerHTML = "Commencez l'aventure !";
            //@ts-ignore
            progressBar?.style.width = "0%";
            //@ts-ignore
            ipcRenderer.send("gameClosed");
            console.log("jeu fermé !");
            await setRpcClientState("Dans le launcher", false, "logo");
          });
          // } else {
          //   evt.sender.send(
          //     "err",
          //     "Nous n'avons pas pu télécharger les dépendances, veuillez réessayer plus tard"
          //   );
          // }
        } catch (e) {
          console.log(e);
          ipcMain.emit("crash");
        }
      }
      // }
    }
    if (account == 0) {
      ipcMain.emit("playernotconnected");
    }
  } else {
    //Pas de fichier profile.json trouvé
    ipcMain.emit("playernotconnected");
  }
}
