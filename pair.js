const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 10000;

// Sehemu ya kuonyesha muonekano wako wa index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sehemu ya kupata Pair Code
app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">
            <div id="console">
                <h2>ZUWA-MD-BOT PAIRING</h2>
                <p>WEKA NAMBA YAKO CHINI (Anza na 255)</p>
                <form action="/get-code" method="GET">
                    <input name="number" placeholder="255712345678" style="padding:10px; border-radius:5px; border:none;">
                    <br><br>
                    <button type="submit" style="padding:10px 20px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">PATA CODE</button>
                </form>
            </div>
        </body>
    `);
});

// Sehemu ya kutengeneza Code (Logic)
app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Tafadhali weka namba!");

    if (fs.existsSync('./session')) {
        fs.rmSync('./session', { recursive: true, force: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" })
    });

    try {
        await delay(1500);
        let code = await sock.requestPairingCode(num);
        
        res.write('<html><body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:Arial;">');
        res.write('<h2>SUCCESS!</h2>');
        res.write('<div style="border:2px solid #28a745; display:inline-block; padding:20px; font-size:30px; letter-spacing:5px;">' + code + '</div>');
        res.write('<p>Nakili code hiyo na uende kwenye WhatsApp -> Linked Devices -> Link with phone number</p>');
        res.write('</body></html>');
        res.end();
    } catch (err) {
        res.send("Kuna tatizo limetokea: " + err);
    }
});

app.listen(port, () => {
    console.log("Server inafanya kazi kwenye port: " + port);
});
