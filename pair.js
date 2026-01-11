const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send(`<body style="background:#000; color:white; text-align:center; font-family:sans-serif; padding-top:100px;">
        <h1>ZUWA-MD BOT IS LIVE!</h1>
        <a href="/pair" style="color:green; font-size:25px; text-decoration:none; border:2px solid green; padding:10px 20px; border-radius:10px;">BONYEZA HAPA KUPATA KODI</a>
    </body>`);
});

app.get('/pair', (req, res) => {
    res.send(`
        <body style="background:#f0f2f5; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
            <div style="background:white; padding:30px; border-radius:15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align:center; width:300px;">
                <h2 style="color:#075e54;">ZUWA-MD PAIRING</h2>
                <p style="font-size:14px; color:#666;">Ingiza namba yako kuanzia na 255</p>
                <form action="/get-code">
                    <input name="number" placeholder="2557XXXXXXXX" style="width:100%; padding:12px; margin-bottom:20px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;" required>
                    <button type="submit" style="width:100%; padding:12px; background:#25d366; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">SUBMIT</button>
                </form>
            </div>
        </body>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Weka namba!");
    
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" })
    });

    try {
        if (!sock.authState.creds.registered) {
            await delay(1500);
            let code = await sock.requestPairingCode(num);
            res.send(`
                <body style="background:#f0f2f5; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
                    <div style="background:white; padding:30px; border-radius:15px; text-align:center; width:300px;">
                        <h3 style="color:#075e54;">KODI YAKO:</h3>
                        <div style="background:#e7f3ef; padding:20px; font-size:30px; font-weight:bold; letter-spacing:5px; border-radius:10px; color:#128c7e; margin-bottom:20px;">\${code}</div>
                        <p style="font-size:13px; color:#666;">Copy kodi hiyo na uiweke kwenye WhatsApp yako (Linked Devices)</p>
                        <a href="/pair" style="color:#075e54; text-decoration:none; font-weight:bold;">Jaribu Namba Nyingine</a>
                    </div>
                </body>
            `);
        }
    } catch (err) {
        res.send("Kosa: " + err);
    }
});

app.listen(port, () => {
    console.log("Server is running...");
});
