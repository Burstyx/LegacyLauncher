"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const remote_1 = require("@electron/remote");
const path_1 = __importDefault(require("path"));
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const fs_1 = __importDefault(require("fs"));
const installer_1 = require("@xmcl/installer");
const DownloadManager_1 = require("./DownloadManager");
const core_1 = require("@xmcl/core");
const Constants_1 = require("../Constants");
const DiscordRpcManager_1 = require("./DiscordRpcManager");
const remote_2 = require("@electron/remote");
const MicrosoftManager_1 = require("./MicrosoftManager");
const sftp = new ssh2_sftp_client_1.default();
var game;
var window = remote_1.BrowserWindow.getFocusedWindow();
async function startMinecraft(progressBar, downloadStatus, resX, resY, fullscreen, ram, ramIndicator) {
    var _a, _b, _c;
    if (fs_1.default.existsSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))) {
        let dataObj = JSON.parse(fs_1.default
            .readFileSync(remote_1.app.getPath("appData") + "\\.riftenrp\\profile.json")
            .toString());
        var account = 0;
        downloadStatus.innerHTML = "Vérification du compte";
        for (const uuid in dataObj["accounts"]) {
            account++;
            console.log("account found");
            if (true) {
                //TODO remplacer "true" par await isAccountBanned(mainWindow)
                try {
                    let aVersion;
                    const pageMinecraft = (await (0, installer_1.getVersionList)()).versions;
                    for (const element in pageMinecraft) {
                        if (pageMinecraft[element]["id"] == "1.18.2") {
                            aVersion = pageMinecraft[element];
                        }
                    }
                    console.log(aVersion);
                    //@ts-ignore
                    const procMinecraft = (0, installer_1.installTask)(aVersion, Constants_1.minecraftFolder);
                    console.log("install task created");
                    console.log("downloading minecraft");
                    downloadStatus.innerHTML = "Téléchargement de Minecraft";
                    window === null || window === void 0 ? void 0 : window.setProgressBar(-1);
                    await procMinecraft.startAndWait({
                        onUpdate(task, chunkSize) {
                            //@ts-ignore
                            progressBar === null || progressBar === void 0 ? void 0 : progressBar.style.width =
                                ((100 * procMinecraft.progress) /
                                    procMinecraft.total).toString() + "%";
                            console.log((100 * procMinecraft.progress) / procMinecraft.total / 100);
                            window === null || window === void 0 ? void 0 : window.setProgressBar((100 * procMinecraft.progress) / procMinecraft.total / 100);
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
                    const procForge = (0, installer_1.installForgeTask)({ mcversion: "1.18.2", version: "40.2.10" }, Constants_1.minecraftFolder);
                    console.log("downloading forge");
                    window === null || window === void 0 ? void 0 : window.setProgressBar(-1);
                    downloadStatus.innerHTML = "Téléchargement de Forge";
                    await procForge.startAndWait({
                        onUpdate(task, chunkSize) {
                            //@ts-ignore
                            progressBar === null || progressBar === void 0 ? void 0 : progressBar.style.width =
                                ((100 * procForge.progress) / procForge.total).toString() + "%";
                            window === null || window === void 0 ? void 0 : window.setProgressBar((100 * procForge.progress) / procForge.total / 100);
                            console.log("forge: " +
                                ((100 * procForge.progress) / procForge.total).toString());
                            if (task.isDone) {
                                console.log("terminé");
                            }
                        },
                    });
                    console.log("downloading java");
                    downloadStatus.innerHTML = "Téléchargement de Java";
                    window === null || window === void 0 ? void 0 : window.setProgressBar(-1);
                    await (0, DownloadManager_1.javaDownloader)(Constants_1.minecraftFolder, progressBar);
                    const resolvedVersion = await core_1.Version.parse(Constants_1.minecraftFolder, "1.18.2-forge-40.2.10");
                    const procDep = (0, installer_1.installDependenciesTask)(resolvedVersion);
                    console.log("downloading dependencies");
                    downloadStatus.innerHTML = "Vérification des dépendances";
                    window === null || window === void 0 ? void 0 : window.setProgressBar(-1);
                    await procDep.startAndWait({
                        onUpdate(task, chunkSize) {
                            //@ts-ignore
                            progressBar === null || progressBar === void 0 ? void 0 : progressBar.style.width =
                                ((100 * procDep.progress) / procDep.total).toString() + "%";
                            window === null || window === void 0 ? void 0 : window.setProgressBar((100 * procDep.progress) / procDep.total / 100);
                            console.log("dep: " + ((100 * procDep.progress) / procDep.total).toString());
                            if (task.isDone) {
                                console.log("terminé");
                            }
                        },
                    });
                    window === null || window === void 0 ? void 0 : window.setProgressBar(-1);
                    // if (await downloadHostedFiles()) {
                    console.log("launching game");
                    downloadStatus.innerHTML = "Lancement du jeu";
                    var id;
                    var name;
                    await (0, MicrosoftManager_1.getProfile)(dataObj["accounts"][uuid]["mcToken"]).then(
                    //@ts-ignore
                    (res) => (id = JSON.parse(res)["id"]));
                    await (0, MicrosoftManager_1.getProfile)(dataObj["accounts"][uuid]["mcToken"]).then(
                    //@ts-ignore
                    (res) => (name = JSON.parse(res)["name"]));
                    const gameProfileInfo = {
                        name: name,
                        id: id,
                    };
                    var profileFile = JSON.parse(fs_1.default
                        .readFileSync(path_1.default.join(remote_1.app.getPath("appData"), ".riftenrp", "profile.json"))
                        .toString("utf-8"));
                    console.log("vérification de l'état du token");
                    console.log(new Date().getTime());
                    console.log(profileFile["accounts"][uuid]["expireAt"]);
                    if (new Date().getTime() >= profileFile["accounts"][uuid]["expireAt"]) {
                        console.log("Le token a besoin d'être rafraichi");
                        if (profileFile["accounts"][uuid]["type"] == "Microsoft") {
                            await (0, MicrosoftManager_1.refreshMinecraftToken)(profileFile["accounts"][uuid]["refreshToken"], profileFile, resX, resY, fullscreen, ram, ramIndicator);
                        }
                    }
                    else {
                        console.log("Le token est à jour");
                    }
                    (0, DownloadManager_1.downloadHostedFiles)(Constants_1.minecraftFolder);
                    game = await (0, core_1.launch)({
                        gameProfile: gameProfileInfo,
                        accessToken: dataObj["accounts"][uuid]["mcToken"],
                        gamePath: Constants_1.minecraftFolder,
                        launcherName: "RiftenRP",
                        launcherBrand: "Riften",
                        javaPath: path_1.default.join(Constants_1.minecraftFolder, "jdk8u312-b07/bin/java.exe"),
                        version: "1.18.2-40.2.10",
                        maxMemory: Number(parseInt(dataObj["settings"]["ram"])),
                        resolution: {
                            width: Number(dataObj["settings"]["resolutionX"]),
                            height: Number(dataObj["settings"]["resolutionY"]),
                        },
                    });
                    //@ts-ignore
                    progressBar === null || progressBar === void 0 ? void 0 : progressBar.style.width = "100%";
                    downloadStatus.innerHTML = "Le jeu est lancé !";
                    await (0, DiscordRpcManager_1.setRpcClientState)("En train de jouer à RiftenRP", true, "logo");
                    (_a = game.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (err) => {
                        console.log(err.toString());
                    });
                    (_b = game.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (err) => {
                        console.log(err.toString());
                    });
                    (_c = game.stdout) === null || _c === void 0 ? void 0 : _c.on("close", async () => {
                        downloadStatus.innerHTML = "Commencez l'aventure !";
                        //@ts-ignore
                        progressBar === null || progressBar === void 0 ? void 0 : progressBar.style.width = "0%";
                        //@ts-ignore
                        ipcRenderer.send("gameClosed");
                        console.log("jeu fermé !");
                        await (0, DiscordRpcManager_1.setRpcClientState)("Dans le launcher", false, "logo");
                    });
                    // } else {
                    //   evt.sender.send(
                    //     "err",
                    //     "Nous n'avons pas pu télécharger les dépendances, veuillez réessayer plus tard"
                    //   );
                    // }
                }
                catch (e) {
                    console.log(e);
                    remote_2.ipcMain.emit("crash");
                }
            }
            // }
        }
        if (account == 0) {
            remote_2.ipcMain.emit("playernotconnected");
        }
    }
    else {
        //Pas de fichier profile.json trouvé
        remote_2.ipcMain.emit("playernotconnected");
    }
}
exports.startMinecraft = startMinecraft;
