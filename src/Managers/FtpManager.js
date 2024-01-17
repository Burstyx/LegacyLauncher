"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeFtpServer = exports.openFtpServer = void 0;
async function openFtpServer(sftpClient) {
    return sftpClient.connect({
        host: "51.77.188.38",
        port: 2022,
        username: "sftp://msr1059.minestrator.com",
        password: "4518Fri145Nov-MSR",
    });
}
exports.openFtpServer = openFtpServer;
async function closeFtpServer(sftpClient) {
    sftpClient.end().catch((err) => {
        console.log("Impossible de fermer le serveur");
        console.log(err);
    });
}
exports.closeFtpServer = closeFtpServer;
