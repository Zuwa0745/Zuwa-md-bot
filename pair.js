const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">
            <h2>ZUWA-MD-BOT PAIRING</h2>
            <form action="/get-code" method="GET">
                <input name="number" placeholder="255712345678" style="padding:10px; border-radius:5px;">
                <button type="submit" style="padding:10px; background:#28a745; color:white; border:none; border-radius:5px;">PATA CODE</button>
            </form>
        </body>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.number.replace(/[^0-9]/g, '');
    if (!num) return res.send("Weka namba sahihi!");

    if (fs.existsSync('./session')) { fs.rmSync('./session', { recursive: true, force: true }); }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.ubuntu("Chrome") // Hii inasaidia sana kuzuia "Couldn't link"
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (s) => {
        const { connection } = s;
        if (connection === "open") {
            await delay(5000);
            let sessionData = fs.readFileSync('./session/creds.json');
            let sessionId = Buffer.from(sessionData).toString('base64');
            await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION-ID:" + sessionId });
            process.exit(0); // Inazima script baada ya kufanikiwa
        }
    });

    try {
        await delay(3000);
        let code = await sock.requestPairingCode(num);
        res.send(`<h2>KODI YAKO: ${code}</h2><p>Iingize WhatsApp sasa hivi!</p>`);
    } catch (err) { res.send("Kuna tatizo: " + err); }
});

app.listen(port);
