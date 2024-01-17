import RPC from "discord-rpc";

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", async () => {
  setRpcClientState("Dans le launcher", false, "logo");
  console.log("Discord RPC prêt !");
});

export async function setRpcClientState(
  state: string,
  showTimestamp: boolean,
  largeImageKey: string
) {
  rpc.setActivity({
    state: state,
    startTimestamp: showTimestamp ? new Date().getTime() : undefined,
    largeImageKey: largeImageKey,
  });
}

rpc.login({ clientId: "896414550889492511" });
