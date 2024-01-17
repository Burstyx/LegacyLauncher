const remote = require("@electron/remote");
const Client = require("ssh2-sftp-client");
const fs = require("fs");
const path = require("path");
const { updateSettings } = require("../src/Managers/LauncherManager");
const { devMode } = require("../src/Constants");
const { startMinecraft } = require("../src/Managers/MinecraftManager");
const {
  microsoftLogin,
  createProfileFile,
} = require("../src/Managers/AccountsManager");
const { refreshMinecraftToken } = require("../src/Managers/MicrosoftManager");
const { refreshSettingsMenu } = require("../src/Managers/LauncherManager");

console.log("Initialisation de UICore.js");

//Variables constantes
const sftp = new Client();

const fullscreen = document.getElementById("fullscreen");
const ram = document.getElementById("ram");
const resY = document.getElementById("resY");
const resX = document.getElementById("resX");
const ramIndicator = document.getElementById("ramIndicator");
const preconfigres = document.getElementById("preconfigres");

window.addEventListener("load", async () => {
  //Vérification au lancement du launcher
  loadingSomething("Chargement en cours...", true);
  updateLauncherUi();
  if (!devMode) {
    if (
      fs.existsSync(
        path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
      )
    ) {
      var profileFile = JSON.parse(
        fs
          .readFileSync(
            path.join(
              remote.app.getPath("appData"),
              ".riftenrp",
              "profile.json"
            )
          )
          .toString("utf-8")
      );

      for (const uuid in profileFile["accounts"]) {
        console.log("vérification de l'état du token");
        console.log(new Date().getTime());
        console.log(profileFile["accounts"][uuid]["expireAt"]);
        if (new Date().getTime() >= profileFile["accounts"][uuid]["expireAt"]) {
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
          } else {
            console.log("Le token est à jour");
          }
        }
      }
      // await openFtpServer(sftp)
      //   .then(async () => {
      //     console.log("verification");

      //     await sftp.get(
      //       "/home/riftenlauncher/info.json",
      //       fs.createWriteStream(path.join(app.getPath("temp"), "temp.json"))
      //     );

      //     var dataObjTemp;
      //     if (fs.existsSync(path.join(app.getPath("temp"), "temp.json"))) {
      //       dataObjTemp = JSON.parse(
      //         fs
      //           .readFileSync(path.join(app.getPath("temp"), "temp.json"))
      //           .toString()
      //       );
      //     }

      //     if (
      //       await updateLauncher(
      //         dataObjTemp,
      //         remote.getCurrentWindow(),
      //         packageJson
      //       )
      //     ) {
      //       return;
      //     }

      //     if (
      //       await isAccountBanned(BrowserWindow.getFocusedWindow(), dataObjTemp)
      //     ) {
      //       console.log("banned player");

      //       playerBanned();
      //     }

      //     if (
      //       (await inMaintenance(dataObjTemp)) &&
      //       !(await isMaintenanceWhitelisted(dataObjTemp))
      //     ) {
      //       console.log("maintenance");

      //       maintenanceDetected();
      //       return;
      //     }
      //   })
      //   .catch((err) => {
      //     noInternetConnection(
      //       "Connexion au serveur impossible... Peut-être devriez vous vérifier votre connexion internet ?",
      //       true
      //     );
      //     return;
      //   });
      refreshSettingsMenu(resX, resY, fullscreen, ram, ramIndicator);
      loadingSomething("", false);
    } else {
      createProfileFile(resX, resY, fullscreen, ram, ramIndicator);
      loadingSomething("", false);
    }
  } else {
    loadingSomething("", false);
  }
});

//Cette fonction permet d'afficher un chargement avec un message custom
function loadingSomething(msg, enableLoadingMode) {
  var mainLauncher = document.getElementById("mainlauncher");
  var loadingDiv = document.getElementById("loading");
  var launcherPageDivs = document.getElementsByClassName("launcherpage");

  loadingDiv.querySelector("h1").innerHTML = msg;

  if (enableLoadingMode) {
    for (let i = 0; i < launcherPageDivs.length; i++) {
      launcherPageDivs[i].style.opacity = "0%";
      launcherPageDivs[i].style.zIndex = "0";
    }
    loadingDiv.style.zIndex = "1";
    loadingDiv.style.opacity = "100%";
  } else {
    mainLauncher.style.zIndex = "1";
    mainLauncher.style.opacity = "100%";
    loadingDiv.style.opacity = "0%";
    loadingDiv.style.zIndex = "0";
  }

  console.log("Loading mode set to " + enableLoadingMode);
}

//Cette fonction permet d'afficher une erreur de connexion à l'utilisateur
function noInternetConnection(msg, showError) {
  var mainLauncher = document.getElementById("mainlauncher");
  var errorDiv = document.getElementById("nointernet");
  var launcherPageDivs = document.getElementsByClassName("launcherpage");

  errorDiv.querySelector("p").innerHTML = msg;

  if (showError) {
    for (let i = 0; i < launcherPageDivs.length; i++) {
      launcherPageDivs[i].style.opacity = "0%";
      launcherPageDivs[i].style.zIndex = "0";
    }
    errorDiv.style.zIndex = "1";
    errorDiv.style.opacity = "100%";
  } else {
    mainLauncher.style.zIndex = "1";
    mainLauncher.style.opacity = "100%";
    loadingDiv.style.opacity = "0%";
    loadingDiv.style.zIndex = "0";
  }

  console.log("Error mode set to " + showError);
}

//Cette fonction permet d'afficher une erreur à l'utilisateur
function errorOccured(msg, showError) {
  var mainLauncher = document.getElementById("mainlauncher");
  var errorDiv = document.getElementById("error");
  var launcherPageDivs = document.getElementsByClassName("launcherpage");

  errorDiv.querySelector("p").innerHTML = msg;

  if (showError) {
    for (let i = 0; i < launcherPageDivs.length; i++) {
      launcherPageDivs[i].style.opacity = "0%";
      launcherPageDivs[i].style.zIndex = "0";
    }
    errorDiv.style.zIndex = "1";
    errorDiv.style.opacity = "100%";
  } else {
    mainLauncher.style.zIndex = "1";
    mainLauncher.style.opacity = "100%";
    errorDiv.style.opacity = "0%";
    errorDiv.style.zIndex = "0";
  }

  console.log("Error mode set to " + showError);
}

const errorSubmit = document.getElementById("errorsubmit");

errorSubmit.addEventListener("mouseover", () => {
  errorSubmit.style.setProperty("filter", "drop-shadow(0px 0px 5px white)");
});

errorSubmit.addEventListener("mouseleave", () => {
  errorSubmit.style.setProperty("filter", "none");
});

errorSubmit.addEventListener("click", () => {
  errorOccured("", false);
});

//Le joueur est banni
function playerBanned() {
  throw new Error("Function not implemented.");
}

//Une maintenance est en cours
function maintenanceDetected() {
  throw new Error("Function not implemented.");
}

const playButton = document.getElementById("playButton");
const progressBar = document.getElementById("progressbar");
const downloadStatus = document.getElementById("downloadstatus");
const settingsBtn = document.getElementById("settings");

var playButtonClickable = true;
var settingsClickable = true;
var accountManagerClickable = true;

playButton.addEventListener("click", () => {
  if (playButtonClickable) {
    playButtonClickable = false;
    settingsClickable = false;
    accountManagerClickable = false;
    playButton.style.color = "rgb(77, 77, 77)";
    playButton.style.textShadow = "0px 0px 300px rgba(255, 255, 255, 0)";
    console.log("Launch Minecraft triggered");
    startMinecraft(
      progressBar,
      downloadStatus,
      resX,
      resY,
      fullscreen,
      ram,
      ramIndicator
    );
  }
});

playButton.addEventListener("mouseover", () => {
  if (playButtonClickable) playButton.style.textShadow = "0px 0px 10px white";
  else playButton.style.textShadow = "none";
});

playButton.addEventListener("mouseleave", () => {
  if (playButtonClickable) playButton.style.textShadow = "none";
});

const blackBackground = document.getElementById("blackbackground");

const settingsDiv = document.getElementById("settingsmenu");

var isSettingsOpen = false;

settingsBtn.addEventListener("click", () => {
  if (settingsClickable) {
    if (isSettingsOpen) {
      console.log("closing settings");
      isSettingsOpen = false;
      settingsDiv.style.left = "-240px";
      blackBackground.style.opacity = "0%";
      setTimeout(() => {
        blackBackground.style.zIndex = 0;
      }, 250);
    } else {
      console.log("opening settings");
      settingsDiv.style.left = "0px";
      blackBackground.style.zIndex = "2";
      blackBackground.style.opacity = "70%";
      isSettingsOpen = true;
    }
  }
});

const loginBtn = document.getElementById("account");
const accountManager = document.getElementById("connectionmenu");
const closeAccountManager = document.getElementById("closeaccountmanager");
const addAccount = document.getElementById("addaccount");

loginBtn.addEventListener("mouseover", () => {
  if (accountManagerClickable)
    loginBtn.style.setProperty("filter", "drop-shadow(0px 0px 5px white)");
  else loginBtn.style.setProperty("filter", "none");
});

loginBtn.addEventListener("mouseleave", () => {
  if (accountManagerClickable) loginBtn.style.setProperty("filter", "none");
});

addAccount.addEventListener("click", async () => {
  loadingSomething("Connexion à votre compte Microsoft", true);
  microsoftLogin(resX, resY, fullscreen, ram, ramIndicator).then((res) => {
    if (res) {
      console.log("Authentification réussi !");
      updateAccountManagerUi();
      updateLauncherUi();
      loadingSomething("", false);
      blackBackground.style.opacity = "70%";
      blackBackground.style.zIndex = "2";
      accountManager.style.opacity = "100%";
      accountManager.style.zIndex = "2";
    } else {
      console.log("Vous n'avez pas le jeu");
      errorOccured(
        "Le compte choisi ne possède pas de licence Minecraft actif !",
        true
      );
    }
  });
});

const accountText = document.getElementById("accounttext");

function updateLauncherUi() {
  if (
    fs.existsSync(
      path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
    )
  ) {
    var profileFile = JSON.parse(
      fs
        .readFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
        )
        .toString("utf-8")
    );

    var accounts = 0;

    for (const uuid in profileFile["accounts"]) {
      accounts++;
      loginBtn.src = profileFile["accounts"][uuid]["skinUrl"];
      accountText.innerHTML = profileFile["accounts"][uuid]["userName"];
    }

    if (accounts == 0) {
      loginBtn.src = "../assets/stevehead.png";
      accountText.innerHTML = "Steve";
    }
  }
}

const noAccountDiv = document.getElementById("noaccount");
var accountMenu = document.getElementById("accountmenu");

var accountDeletionBtns = [];

loginBtn.addEventListener("click", () => {
  if (accountManagerClickable) {
    blackBackground.style.opacity = "70%";
    blackBackground.style.zIndex = "2";
    accountManager.style.opacity = "100%";
    accountManager.style.zIndex = "2";
    updateAccountManagerUi();
  }
});

function updateAccountManagerUi() {
  closeAccountManager.style.zIndex = "3";
  var accountFound;
  if (
    fs.existsSync(
      path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
    )
  ) {
    var profileFile = JSON.parse(
      fs
        .readFileSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
        )
        .toString("utf-8")
    );

    var account = 0;

    accountMenu.innerHTML = "";
    accountDeletionBtns = [];

    for (const uuid in profileFile["accounts"]) {
      account++;
      noAccountDiv.style.opacity = "0%";
      noAccountDiv.style.zIndex = "0";
      accountMenu.style.opacity = "100%";
      accountMenu.style.zIndex = "2";
      accountMenu.innerHTML += `<div style="width: 90%; height: 20%; margin-top: 3%; display: flex; padding: 0 10 0 10; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <img id="account${account}" src="../assets/stevehead.png" style="width: 72px; height: 72px; border-radius: 80%; align-content: center;">
              <div style="display: flex; flex-direction: column;">
                <p id="accounttext${account}" style="font-size: 24; padding-left: 21;">Pseudo : </p>
                <p id="accountuuid${account}" style="font-size: 14; padding-left: 21;">UUID : </p>
              </div>
            </div>
            <p id="accountdeletion${account}" class="deleteBtn" style="font-size: 24; height:fit-content; display: flex; align-items: center;">Delete</p>
          </div>`;

      document.getElementById("account" + account).src =
        profileFile["accounts"][uuid]["skinUrl"];
      document.getElementById("accounttext" + account).innerHTML =
        "Pseudo : " + profileFile["accounts"][uuid]["userName"];
      document.getElementById("accountuuid" + account).innerHTML =
        "UUID : " + profileFile["accounts"][uuid]["uuid"];

      accountDeletionBtns.push(
        document.getElementById("accountdeletion" + account)
      );
    }
    if (account == 0) {
      accountMenu.style.opacity = "0%";
      accountMenu.style.zIndex = "0";
      noAccountDiv.style.opacity = "100%";
      noAccountDiv.style.zIndex = "2";
    }
  } else {
    accountMenu.style.opacity = "0%";
    accountMenu.style.zIndex = "0";
    noAccountDiv.style.opacity = "100%";
    noAccountDiv.style.zIndex = "2";
  }
}

document.addEventListener("click", (evt) => {
  for (const accountDeleter in accountDeletionBtns) {
    if (evt.target == accountDeletionBtns[accountDeleter]) {
      console.log("delete account");
      var profileFile;
      if (
        fs.existsSync(
          path.join(remote.app.getPath("appData"), ".riftenrp", "profile.json")
        )
      ) {
        profileFile = JSON.parse(
          fs
            .readFileSync(
              path.join(
                remote.app.getPath("appData"),
                ".riftenrp",
                "profile.json"
              )
            )
            .toString("utf-8")
        );
      } else {
        errorOccured(
          "Une erreur s'est produite lors de la récupération de vos comptes, essayez de vous connecter à nouveau et si le problème persiste contactez nous sur notre serveur Discord",
          true
        );
      }
      var account = 0;
      for (const uuid in profileFile["accounts"]) {
        account++;
        if (
          new DOMParser()
            .parseFromString(
              document.getElementById("accountmenu").innerHTML,
              "text/html"
            )
            .getElementById("accountdeletion" + account) != null
        ) {
          console.log("on supprime");
          delete profileFile["accounts"][uuid];
          fs.writeFileSync(
            path.join(
              remote.app.getPath("appData"),
              ".riftenrp",
              "profile.json"
            ),
            JSON.stringify(profileFile)
          );
          accountMenu.style.opacity = "0%";
          accountMenu.style.zIndex = "0";
          noAccountDiv.style.opacity = "100%";
          noAccountDiv.style.zIndex = "2";
          updateAccountManagerUi();
          updateLauncherUi();
        }
      }
    }
  }
});

addAccount.addEventListener("mouseover", () => {
  addAccount.style.setProperty("filter", "drop-shadow(0px 0px 5px white)");
});

addAccount.addEventListener("mouseleave", () => {
  addAccount.style.setProperty("filter", "none");
});

closeAccountManager.addEventListener("click", () => {
  closeAccountManager.style.zIndex = "0";
  blackBackground.style.opacity = "0%";
  accountManager.style.opacity = "0%";
  setTimeout(() => {
    accountManager.style.zIndex = "0";
    blackBackground.style.zIndex = "0";
  }, 250);
});

closeAccountManager.addEventListener("mouseover", () => {
  closeAccountManager.style.setProperty(
    "filter",
    "drop-shadow(0px 0px 5px white)"
  );
});

closeAccountManager.addEventListener("mouseleave", () => {
  closeAccountManager.style.setProperty("filter", "none");
});

//Ipc
remote.ipcMain.on("gameClosed", (evt) => {
  playButtonClickable = true;
  playButton.style.textShadow = "0px 0px 0px rgba(255, 255, 255, 0)";
  playButton.style.color = "rgb(184, 184, 184)";
  accountManagerClickable = true;
  settingsClickable = true;
});

remote.ipcMain.on("noInternetConnection", (msg, show) => {
  noInternetConnection(msg, show);
});

remote.ipcMain.on("loadingSomething", (msg, show) => {
  loadingSomething(msg, show);
});

remote.ipcMain.on("errorOccured", (msg, show) => {
  errorOccured(msg, show);
});

remote.ipcMain.on("playernotconnected", (evt) => {
  downloadStatus.innerHTML = "Commencez l'aventure !";
  blackBackground.style.opacity = "70%";
  blackBackground.style.zIndex = "2";
  accountManager.style.opacity = "100%";
  accountManager.style.zIndex = "2";

  updateAccountManagerUi();

  playButtonClickable = true;
  playButton.style.textShadow = "0px 0px 0px rgba(255, 255, 255, 0)";
  playButton.style.color = "rgb(184, 184, 184)";
});

resX.addEventListener("change", (evt) => {
  console.log(resX.value);
  if (resX.value.length > 4) {
    resX.value = resX.value.slice(0, 4);
  }
  updateSettings(
    resX,
    resY,
    fullscreen,
    ram,
    ramIndicator,
    undefined,
    resX.value
  );
});

resY.addEventListener("change", (evt) => {
  console.log(resY.value);
  if (resY.value.length > 4) {
    resY.value = resY.value.slice(0, 4);
  }
  updateSettings(
    resX,
    resY,
    fullscreen,
    ram,
    ramIndicator,
    undefined,
    undefined,
    resY.value
  );
});

fullscreen.addEventListener("change", (evt) => {
  console.log(fullscreen.checked);
  updateSettings(
    resX,
    resY,
    fullscreen,
    ram,
    ramIndicator,
    undefined,
    undefined,
    undefined,
    fullscreen.checked
  );
});

ram.addEventListener("change", (evt) => {
  console.log(ram.value);
  ramIndicator.innerHTML = "Alloué actuellement : " + ram.value + "Go";
  updateSettings(resX, resY, fullscreen, ram, ramIndicator, ram.value);
});

preconfigres.addEventListener("change", () => {
  var getSelectedValue = preconfigres.value;
  preconfigres.value = "default";

  console.log(getSelectedValue.split("x")[0]);
  console.log(getSelectedValue.split("x")[1]);

  updateSettings(
    resX,
    resY,
    fullscreen,
    ram,
    ramIndicator,
    undefined,
    getSelectedValue.split("x")[0],
    getSelectedValue.split("x")[1]
  );

  refreshSettingsMenu(resX, resY, fullscreen, ram, ramIndicator);
});
