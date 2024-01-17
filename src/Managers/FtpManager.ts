import sftp from "ssh2-sftp-client";

export async function openFtpServer(sftpClient: sftp) {
  return sftpClient.connect({
    host: "51.77.188.38",
    port: 2022,
    username: "sftp://msr1059.minestrator.com",
    password: "4518Fri145Nov-MSR",
  });
}

export async function closeFtpServer(sftpClient: sftp) {
  sftpClient.end().catch((err) => {
    console.log("Impossible de fermer le serveur");
    console.log(err);
  });
}
