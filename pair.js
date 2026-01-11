const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

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
            // Hapa bot itatuma Session ID kwenye chat yako ya WhatsApp
            await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION;;" + session_id });
            console.log("SESSION ID IMETUMWA!");
            process.exit(0);
        }
    });
}
startPair();
