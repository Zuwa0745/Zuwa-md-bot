const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => { res.redirect('/pair'); });

app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#000; color:#0f0; font-family:monospace; padding:20px;">
            <div id="console">
                <p>> Initializing ZUWA-MD-V2...</p>
                <p>> Connecting to WhatsApp Servers...</p>
                <p>> System Status: Online</p>
                <p>---------------------------------------</p>
                <h2 style="color:#fff;">[ PAIRING TERMINAL ]</h2>
                <p>WEKA NAMBA YAKO CHINI ILI KUPATA KODI:</p>
                <form action="/get-code">
                    <span style="color:#fff;">root@zuwa-md:~#</span> 
                    <input name="number" placeholder="2557XXXXXXXX" autofocus style="background:transparent; border:none; color:#0f0; outline:none; font-family:monospace; width:200px;" required>
                    <br><br>
                    <button type="submit" style="background:#0f0; color:#000; border:none; padding:5px 15px; cursor:pointer; font-weight:bold;">GENERATE CODE</button>
                </form>
            </div>
        </body>
    `);
});

app.get('/get-code', async (req, res)
