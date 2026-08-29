const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let status = "starting";
let client = null;
let messageCount = 0;
const startTime = Date.now();

const bold = (text) => `*${text}*`;
const italic = (text) => `_${text}_`;
const mono = (text) => `\`\`\`${text}\`\`\``;
const line = () => `━━━━━━━━━━━━━━━`;
const doubleLine = () => `════════════════════`;

function runtime() {
    const sec = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
}

async function startBot() {
    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "ma-bot",
            dataPath: "./.wwebjs_auth"
        }),
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-extensions",
                "--disable-logging",
                "--no-first-run",
                "--no-default-browser-check",
                "--single-process",
                "--no-zygote",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding"
            ]
        },
        restartOnAuthFail: true,
        takeoverOnConflict: true,
        takeoverTimeoutMs: 0
    });

    client.on("ready", () => {
        status = "ready";
        console.log("✅ Bot ready!");
    });

    client.on("message", async (message) => {
        try {
            const rawText = message.body || "";
            const text = rawText.trim().toLowerCase();
            messageCount++;

            if (text === ".test") {
                await message.reply(`${bold('✅ Bot working!')}\n⏱️ ${runtime()}`);
                return;
            }

            if (text === ".menu" || text === ".help") {
                await message.reply(
                    `${doubleLine()}\n` +
                    `${bold('🤖 MA BOT MENU')}\n` +
                    `${doubleLine()}\n\n` +
                    `${bold('📌 GENERAL')}\n${line()}\n` +
                    `${mono('.ping')} - Check bot\n` +
                    `${mono('.alive')} - Bot status\n` +
                    `${mono('.info')} - Bot info\n` +
                    `${mono('.owner')} - Owner info\n\n` +
                    `${bold('👥 GROUP')}\n${line()}\n` +
                    `${mono('.groupinfo')} - Group details\n` +
                    `${mono('.admins')} - List admins\n` +
                    `${mono('.tagall')} - Tag everyone\n` +
                    `${mono('.kick')} - Remove member\n` +
                    `${mono('.add')} - Add member\n` +
                    `${mono('.mute')} - Mute group\n` +
                    `${mono('.unmute')} - Unmute group\n\n` +
                    `${bold('🛠️ TOOLS')}\n${line()}\n` +
                    `${mono('.sticker')} - Make sticker\n` +
                    `${mono('.calc')} - Calculator\n` +
                    `${mono('.coinflip')} - Flip coin\n` +
                    `${mono('.dice')} - Roll dice\n` +
                    `${mono('.joke')} - Random joke\n` +
                    `${mono('.quote')} - Random quote\n\n` +
                    `${doubleLine()}\n` +
                    `${italic('MA Developers')}\n` +
                    `${doubleLine()}`
                );
                return;
            }

            if (text === ".ping") {
                await message.reply(`${bold('🏓 Pong!')}`);
                return;
            }

            if (text === ".alive") {
                await message.reply(`${bold('✅ Bot Alive')}\n⏱️ ${runtime()}`);
                return;
            }

            if (text === ".info") {
                const info = client.info;
                await message.reply(`${bold('📱 Bot Info')}\n👤 ${info?.pushname || 'MA BOT'}`);
                return;
            }

            if (text === ".owner") {
                await message.reply(
                    `${bold('👑 Owner')}\nMuhammad Ayan\n${italic('MA Developers')}`
                );
                return;
            }

            if (text === ".groupinfo") {
                if (!message.from.endsWith("@g.us")) {
                    await message.reply(bold('❌ Group only!'));
                    return;
                }
                const chat = await message.getChat();
                await message.reply(`${bold('👥')} ${chat.name}`);
                return;
            }

            if (text === ".tagall") {
                if (!message.from.endsWith("@g.us")) return;
                const chat = await message.getChat();
                const mentions = chat.participants;
                let out = `${bold('📢 Attention')}\n\n`;
                mentions.forEach(p => {
                    out += `@${p.id.user} `;
                });
                await message.reply(out, undefined, {
                    mentions: mentions.map(p => p.id._serialized)
                });
                return;
            }

            if (text === ".sticker") {
                if (!message.hasMedia) return;
                const media = await message.downloadMedia();
                if (!media) return;
                await client.sendMessage(
                    message.from,
                    new MessageMedia(media.mimetype, media.data, "MA-BOT"),
                    { sendMediaAsSticker: true }
                );
                return;
            }

            if (text === ".calc") {
                const expression = rawText.substring(5).trim();
                if (!expression) return;
                try {
                    const result = Function(`"use strict"; return (${expression})`)();
                    await message.reply(`${bold('🧮')} ${result}`);
                } catch {
                    await message.reply(bold('❌ Error'));
                }
                return;
            }

            if (text === ".coinflip") {
                await message.reply(`${bold('🪙 ' + (Math.random() < 0.5 ? "Heads" : "Tails"))}!`);
                return;
            }

            if (text === ".dice") {
                await message.reply(`${bold('🎲 ' + (Math.floor(Math.random() * 6) + 1))}`);
                return;
            }

            if (text === ".joke") {
                const jokes = ["Why did developer go broke? Cache problems!", "Programmer's favorite place: Foo Bar"];
                await message.reply(`${bold('😄')} ${italic(jokes[Math.floor(Math.random() * jokes.length)])}`);
                return;
            }

        } catch (error) {
            console.error("[ERROR]", error.message);
        }
    });

    await client.initialize();
}

app.get("/", (req, res) => {
    res.send("MA BOT is running!");
});

app.post("/api/pair", async (req, res) => {
    try {
        const phone = req.body.phone;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone required" });
        }

        let number = String(phone).replace(/\D/g, "");
        if (number.startsWith("0")) number = "92" + number.substring(1);

        const code = await client.requestPairingCode(number, true);
        res.json({ success: true, phone: number, pairingCode: code });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Bot running on port ${PORT}`);
});

startBot().catch(err => {
    console.error("[START ERROR]", err.message);
});
