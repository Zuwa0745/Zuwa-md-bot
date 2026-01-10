const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startPair() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        console.log("Inatafuta kodi ya pairing kwa 255675112349...");
        await delay(1500);
        // Namba yako tayari imewekwa hapa
        let code = await sock.requestPairingCode("255675112349"); 
        console.log("----------------------------");
        console.log("KODI YAKO NI: " + code);
        console.log("----------------------------");
    }
}
startPair();
