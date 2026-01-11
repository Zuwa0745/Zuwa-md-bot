const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const fs = require('fs');
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => { res.redirect('/pair'); });

app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#0f0; font-family:monospace; padding:20px;">
            <div id="console">
                <h2 style="color:#fff;">[ PAIRING TERMINAL ]</h2>
                <p>WEKA NAMBA YAKO CHINI:</p>
                <form action="/get-code">
                    <input name="number" placeholder="2557XXXXXXXX" autofocus style="background:transparent; border:1px solid #0f0; color:#0f0; padding:10px; width:250px;" required>
                    <br><br>
                    <button type="submit" style="background:#0f0; color:#000; border:none; padding:10px 20px; cursor:pointer; font-weight:bold;">GET CODE NOW</button>
                </form>
            </div>
        </body>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    // Futa session ya zamani ili kuzuia mgongano
    if (fs.existsSync('./session')) { fs.rmSync('./session', { recursive: true, force: true }); }
    
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }) });

    try {
        await delay(1500);
        let code = await sock.requestPairingCode(num);
        
        // Hii inatuma jibu haraka kwa browser ili loading iishe
        res.write('<html><body style="background:#000; color:#0f0; font-family:monospace; padding:20px; text-align:center;">');
        res.write('<h2>SUCCESS!</h2>');
        res.write('<div style="border:2px solid #0f0; padding:30px; font-size:40px;">' + code + '</div>');
        res.write('<p>Ingiza kodi hiyo kwenye WhatsApp sasa hivi!</p>');
        res.write('</body></html>');
        res.end();
        
    } catch (err) { res.send("Error: " + err); }
});

app.listen(port, () => { console.log("Seva imewaka tayari!"); });
