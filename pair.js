const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send("<h1>ZUWA-MD PAIRING SITE IS LIVE!</h1><p>Ongeza <b>/pair</b> mwishoni mwa link.</p>");
});

app.get('/pair', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h2>ZUWA-MD PAIRING</h2>
            <form action="/get-code">
                <input name="number" placeholder="2557XXXXXXXX" style="padding:10px; width:200px;" required><br><br>
                <button type="submit" style="padding:10px 20px; background:green; color:white; border:none;">SUBMIT</button>
            </form>
        </div>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send("Weka namba!");
    res.send("<h1>Angalia kodi yako kwenye Render Logs baada ya sekunde 10!</h1>");
    startPair(num);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

async function startPair(phoneNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" })
    });

    sock.ev.on('creds.update', saveCreds);

    try {
        if (!sock.authState.creds.registered) {
            await delay(1500);
            let code = await sock.requestPairingCode(phoneNumber);
            console.log("----------------------------");
            console.log("KODI YAKO NI: " + code);
            console.log("----------------------------");
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === "open") {
                await delay(5000);
                let session_id = Buffer.from(JSON.stringify(state.creds)).toString("base64");
                await sock.sendMessage(sock.user.id, { text: "ZUWA-MD-SESSION;;" + session_id });
                process.exit(0);
            }
        });
    } catch (err) {
        console.log("Kosa: " + err);
    }
}
