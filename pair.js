const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

// Hii sehemu ndiyo itafanya link yako ifunguke kwenye browser
app.get('/', (req, res) => {
    res.send("ZUWA-MD PAIRING SITE IS LIVE!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function startPair() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === "open") {
            await delay(5000);
            let session_id = Buffer.from(JSON.stringify(state.creds)).toString("base64");
            await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION;;" + session_id });
            console.log("SESSION ID IMETUMWA!");
            process.exit(0);
        }
    });
}
startPair();
