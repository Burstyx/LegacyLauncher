const ipcRenderer = require("electron").ipcRenderer;

let closeWindow = document.getElementById("close");
let reduceWindow = document.getElementById("reduce");

closeWindow.addEventListener("click", () => {
  ipcRenderer.send("close-me");
});

reduceWindow.addEventListener("click", () => {
  ipcRenderer.send("reduceWindow");
});
