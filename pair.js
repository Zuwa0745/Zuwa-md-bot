const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">
            <h2>ZUWA-MD-BOT PAIRING</h2>
            <p>Ingiza namba yako (Anza na 255)</p>
            <form action="/get-code" method="GET">
                <input name="number" placeholder="255712345678" style="padding:10px; border-radius:5px;">
                <button type="submit" style="padding:10px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">PATA CODE</button>
            </form>
        </body>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Tafadhali weka namba!");

    if (fs.existsSync('./session')) { fs.rmSync('./session', { recursive: true, force: true }); }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop")
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === "open") {
            await delay(5000);
            let sessionData = fs.readFileSync('./session/creds.json');
            let sessionId = Buffer.from(sessionData).toString('base64');
            await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION-ID:" + sessionId });
            console.log("Success! Session ID sent.");
        }
    });

    try {
        await delay(2000);
        let code = await sock.requestPairingCode(num);
        res.write('<html><body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">');
        res.write('<h2>KODI YAKO:</h2>');
        res.write('<div style="border:2px solid #28a745; display:inline-block; padding:20px; font-size:30px; letter-spacing:5px;">' + code + '</div>');
        res.write('<p>Ingiza kodi hii kwenye WhatsApp sasa hivi!</p>');
        res.end('</body></html>');
    } catch (err) { res.send("Kuna tatizo: " + err); }
});

app.listen(port, () => { console.log("Server Live!"); });
