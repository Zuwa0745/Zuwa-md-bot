const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 10000;

// Inaonyesha muonekano wa index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ukurasa wa kuingiza namba
app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">
            <div style="background:#111; padding:30px; border-radius:15px; display:inline-block;">
                <h2>ZUWA-MD-BOT PAIRING</h2>
                <p>Ingiza namba yako (Anza na 255)</p>
                <form action="/get-code" method="GET">
                    <input name="number" placeholder="255712345678" style="padding:10px; border-radius:5px; border:none; width:200px;">
                    <br><br>
                    <button type="submit" style="padding:10px 20px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">PATA CODE</button>
                </form>
            </div>
        </body>
    `);
});

// Sehemu ya kutengeneza Code na Session ID
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
            try {
                let sessionData = fs.readFileSync('./session/creds.json');
                let sessionId = Buffer.from(sessionData).toString('base64');
                // Inatuma Session ID kwenye WhatsApp yako
                await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION-ID:" + sessionId });
            } catch (e) { console.log("Error sending session: " + e); }
        }
    });

    try {
        await delay(2000);
        let code = await sock.requestPairingCode(num);
        res.write('<html><body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">');
        res.write('<h2>KODI YAKO HII HAPA:</h2>');
        res.write('<div style="border:2px solid #28a745; display:inline-block; padding:20px; font-size:30px; letter-spacing:5px; background:#111;">' + code + '</div>');
        res.write('<p>Nakili kodi hiyo na uiingize kwenye WhatsApp sasa hivi!</p>');
        res.write('<p style="color:yellow;">Ukishaiweka, bot itakutumia Session ID kwenye chat yako.</p>');
        res.end('</body></html>');
    } catch (err) { res.send("Kuna tatizo limetokea: " + err); }
});

app.listen(port, () => { console.log("Server Live on " + port); });
