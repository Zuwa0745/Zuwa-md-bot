app.get('/pair', async (req, res) => {
    res.send("<h1>WEKA NAMBA YAKO:</h1><form action='/get-code'><input name='number' placeholder='255...' required><button>SUBMIT</button></form>");
});
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

// Hii inafanya link kuu ifunguke
app.get('/', (req, res) => {
    res.send("ZUWA-MD PAIRING SITE IS LIVE!");
});

// HII NDIO SEHEMU ILIYOKUWA INAKOSEKANA (Inatengeneza /pair)
app.get('/pair', async (req, res) => {
    res.send("<h1>INGIZA NAMBA YAKO HAPA:</h1><form action='/get-code'><input name='number' placeholder='255...' required><button>SUBMIT</button></form>");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
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
            process.exit(0);
        }
    });
}
startPair();
