import { app, BrowserWindow } from "@electron/remote";

import fs from "fs";
import Client from "ssh2-sftp-client";
import path from "path";
import download from "download";
import { closeFtpServer, openFtpServer } from "./FtpManager";

const sftp = new Client();

export async function downloadHostedFiles(minecraftFolder: string) {
  if (await openFtpServer(sftp)) {
    if (!fs.existsSync(path.join(app.getPath("temp"), "temp.json"))) {
      await sftp.get(
        "/info.json",
        fs.createWriteStream(path.join(app.getPath("temp"), "temp.json"))
      );
    } else {
      console.log("Impossible de récuperer les informations pour le launcher");
    }
    var localFolder = fs.readdirSync(minecraftFolder);
    var serverFolder = await sftp.list("/datas");
    // Supprimer fichiers en trop
    console.log("----------------------------");
    console.log("Suppression des fichiers en trop");
    console.log("----------------------------");
    for (const i in localFolder) {
      console.log(
        "####Vérification dans le dossier " + localFolder[i] + "####"
      );
      var good = false;
      // i renvoie le nom du fichier
      for (const j in serverFolder) {
        // j renvoie un json des infos de chaque fichier

        if (localFolder[i] == serverFolder[Number(j)]["name"]) {
          console.log(localFolder[i] + " existe dans le serveur");
          let localFiles = fs.readdirSync(
            path.join(minecraftFolder, localFolder[i])
          );
          let serverFiles = await sftp.list(
            "/datas/" + localFolder[i]
          );
          for (const k in localFiles) {
            for (const l in serverFiles) {
              if (localFiles[k] == serverFiles[l]["name"]) {
                console.log(localFiles[k] + " = " + serverFiles[l]["name"]);
                good = true;
                console.log("OK");
                break;
              } else {
                console.log(localFiles[k] + " != " + serverFiles[l]["name"]);
                good = false;
              }
            }
            if (!good) {
              console.log(
                "Le fichier/dossier " + localFiles[k] + " n'existe pas..."
              );
              if (
                fs
                  .lstatSync(
                    path.join(
                      minecraftFolder,
                      localFolder[i] + "/" + localFiles[k]
                    )
                  )
                  .isDirectory()
              ) {
                fs.rmdirSync(
                  path.join(
                    minecraftFolder,
                    localFolder[i] + "/" + localFiles[k]
                  ),
                  { recursive: true }
                );
                console.log(
                  "Le dossier " + localFiles[k] + " a été supprimé..."
                );
              } else {
                fs.rmSync(
                  path.join(
                    minecraftFolder,
                    localFolder[i] + "/" + localFiles[k]
                  )
                );
                console.log(
                  "Le fichier " + localFiles[k] + " a été supprimé..."
                );
              }
            }
          }
        }
      }
    }
    console.log("----------------------------");
    console.log("Téléchargement des fichiers manquant");
    console.log("----------------------------");

    // Télécharger fichiers manquant

    let fileGood = false;
    for (const i in serverFolder) {
      let good = false;
      for (const j in localFolder) {
        console.log(
          "Vérification du dossier local " +
            localFolder[j] +
            " sur le dossier serveur " +
            serverFolder[i]["name"]
        );

        if (serverFolder[i]["name"] == localFolder[j]) {
          console.log(serverFolder[i]["name"] + " == " + localFolder[j]);
          good = true;
          let localFiles = fs.readdirSync(
            path.join(minecraftFolder, localFolder[j])
          );
          let serverFiles = await sftp.list(
            "/datas/" + serverFolder[i]["name"]
          );

          if (localFiles.length == 0) {
            await sftp.downloadDir(
              "/datas/" + serverFolder[i]["name"],
              path.join(minecraftFolder, serverFolder[i]["name"])
            );
            break;
          }

          for (const serverFile in serverFiles) {
            for (const localFile in localFiles) {
              console.log(
                "Vérification du fichier local " +
                  localFiles[serverFile] +
                  " sur le fichier serveur " +
                  serverFiles[serverFile]["name"]
              );
              if (serverFiles[serverFile]["name"] == localFiles[localFile]) {
                fileGood = true;
                console.log("fichier existe");
                console.log(serverFiles[serverFile]);
                break;
              } else {
                fileGood = false;
                console.log("Le fichier n'existe pas");
              }
            }
            if (!fileGood) {
              await sftp.downloadDir(
                "/datas/" + serverFolder[i]["name"],
                path.join(minecraftFolder, serverFolder[i]["name"])
              );
            }
          }
          break;
        } else good = false;
      }
      if (!good) {
        fs.mkdirSync(path.join(minecraftFolder, serverFolder[i]["name"]));
        await sftp.downloadDir(
          "/datas/" + serverFolder[i]["name"],
          path.join(minecraftFolder, serverFolder[i]["name"])
        );
      }
    }

    await closeFtpServer(sftp);
    return true;
  } else {
    console.log(
      "La connection au serveur n'a pu aboutir, impossible de télécharger les dépendances"
    );
  }
}

export async function javaDownloader(
  minecraftFolder: string,
  progressBar: HTMLElement
) {
  if (!fs.existsSync(path.join(minecraftFolder, "jdk8u312-b07"))) {
    const downloadProc = await download(
      "https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u312-b07/OpenJDK8U-jdk_x64_windows_hotspot_8u312b07.zip",
      minecraftFolder,
      { extract: true }
    ).addListener("downloadProgress", (progress) => {
      //@ts-ignore
      progressBar?.style.width = progress.percent * 100 + "%";
      BrowserWindow.getFocusedWindow()?.setProgressBar(progress.percent);
      console.log("java:" + progress.percent * 100);
    });
  } else {
    console.log("java est déjà installé !");
    return true;
  }
}
