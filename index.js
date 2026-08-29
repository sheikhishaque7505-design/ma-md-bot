```js
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
    try {
        console.log("🚀 Starting MA BOT...");

        client = new Client({
            authStrategy: new LocalAuth({
                clientId: "ma-bot",
                dataPath: "./.wwebjs_auth"
            }),

            puppeteer: {
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--disable-extensions",
                    "--no-first-run",
                    "--no-default-browser-check",
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

        client.on("qr", () => {
            status = "qr";
            console.log("📱 QR code generated.");
        });

        client.on("authenticated", () => {
            status = "authenticated";
            console.log("🔐 WhatsApp authenticated.");
        });

        client.on("auth_failure", (msg) => {
            status = "auth_failure";
            console.error("❌ Authentication failure:", msg);
        });

        client.on("ready", () => {
            status = "ready";
            console.log("✅ MA BOT is ready!");
        });

        client.on("disconnected", (reason) => {
            status = "disconnected";
            console.log("⚠️ WhatsApp disconnected:", reason);
        });

        client.on("message", async (message) => {
            try {
                const rawText = message.body || "";
                const text = rawText.trim().toLowerCase();

                messageCount++;

                // TEST
                if (text === ".test") {
                    await message.reply(
                        `${bold("✅ Bot working!")}\n⏱️ ${runtime()}`
                    );
                    return;
                }

                // MENU
                if (text === ".menu" || text === ".help") {
                    await message.reply(
                        `${doubleLine()}\n` +
                        `${bold("🤖 MA BOT MENU")}\n` +
                        `${doubleLine()}\n\n` +

                        `${bold("📌 GENERAL")}\n` +
                        `${line()}\n` +
                        `${mono(".ping")} - Check bot\n` +
                        `${mono(".alive")} - Bot status\n` +
                        `${mono(".info")} - Bot info\n` +
                        `${mono(".owner")} - Owner info\n\n` +

                        `${bold("👥 GROUP")}\n` +
                        `${line()}\n` +
                        `${mono(".groupinfo")} - Group details\n` +
                        `${mono(".admins")} - List admins\n` +
                        `${mono(".tagall")} - Tag everyone\n` +
                        `${mono(".kick")} - Remove member\n` +
                        `${mono(".add")} - Add member\n` +
                        `${mono(".mute")} - Mute group\n` +
                        `${mono(".unmute")} - Unmute group\n\n` +

                        `${bold("🛠️ TOOLS")}\n` +
                        `${line()}\n` +
                        `${mono(".sticker")} - Make sticker\n` +
                        `${mono(".calc")} - Calculator\n` +
                        `${mono(".coinflip")} - Flip coin\n` +
                        `${mono(".dice")} - Roll dice\n` +
                        `${mono(".joke")} - Random joke\n` +
                        `${mono(".quote")} - Random quote\n\n` +

                        `${doubleLine()}\n` +
                        `${italic("MA Developers")}\n` +
                        `${doubleLine()}`
                    );

                    return;
                }

                // PING
                if (text === ".ping") {
                    await message.reply(`${bold("🏓 Pong!")}`);
                    return;
                }

                // ALIVE
                if (text === ".alive") {
                    await message.reply(
                        `${bold("✅ Bot Alive")}\n⏱️ ${runtime()}`
                    );
                    return;
                }

                // INFO
                if (text === ".info") {
                    const info = client?.info;

                    await message.reply(
                        `${bold("📱 Bot Info")}\n` +
                        `👤 ${info?.pushname || "MA BOT"}`
                    );

                    return;
                }

                // OWNER
                if (text === ".owner") {
                    await message.reply(
                        `${bold("👑 Owner")}\n` +
                        `Muhammad Ayan\n` +
                        `${italic("MA Developers")}`
                    );

                    return;
                }

                // GROUP INFO
                if (text === ".groupinfo") {
                    if (!message.from.endsWith("@g.us")) {
                        await message.reply(bold("❌ Group only!"));
                        return;
                    }

                    const chat = await message.getChat();

                    await message.reply(
                        `${bold("👥 Group")}\n${chat.name}`
                    );

                    return;
                }

                // TAG ALL
                if (text === ".tagall") {
                    if (!message.from.endsWith("@g.us")) {
                        return;
                    }

                    const chat = await message.getChat();
                    const mentions = chat.participants;

                    let out = `${bold("📢 Attention")}\n\n`;

                    mentions.forEach((p) => {
                        out += `@${p.id.user} `;
                    });

                    await message.reply(out, undefined, {
                        mentions: mentions.map(
                            (p) => p.id._serialized
                        )
                    });

                    return;
                }

                // STICKER
                if (text === ".sticker") {
                    if (!message.hasMedia) {
                        await message.reply(
                            bold("❌ Send/reply to an image or video.")
                        );
                        return;
                    }

                    const media = await message.downloadMedia();

                    if (!media) {
                        await message.reply(
                            bold("❌ Media download failed.")
                        );
                        return;
                    }

                    await client.sendMessage(
                        message.from,
                        new MessageMedia(
                            media.mimetype,
                            media.data,
                            "MA-BOT"
                        ),
                        {
                            sendMediaAsSticker: true
                        }
                    );

                    return;
                }

                // CALCULATOR
                if (text.startsWith(".calc")) {
                    const expression = rawText
                        .substring(5)
                        .trim();

                    if (!expression) {
                        await message.reply(
                            bold("❌ Example: .calc 10+20")
                        );
                        return;
                    }

                    try {
                        const result = Function(
                            `"use strict"; return (${expression})`
                        )();

                        await message.reply(
                            `${bold("🧮 Result")}\n${result}`
                        );
                    } catch {
                        await message.reply(
                            bold("❌ Invalid calculation.")
                        );
                    }

                    return;
                }

                // COIN FLIP
                if (text === ".coinflip") {
                    const result =
                        Math.random() < 0.5
                            ? "Heads"
                            : "Tails";

                    await message.reply(
                        `${bold("🪙 " + result + "!")}`
                    );

                    return;
                }

                // DICE
                if (text === ".dice") {
                    const result =
                        Math.floor(Math.random() * 6) + 1;

                    await message.reply(
                        `${bold("🎲 " + result)}`
                    );

                    return;
                }

                // JOKE
                if (text === ".joke") {
                    const jokes = [
                        "Why did the developer go broke? Cache problems!",
                        "Programmer's favorite place: Foo Bar"
                    ];

                    const joke =
                        jokes[
                            Math.floor(
                                Math.random() * jokes.length
                            )
                        ];

                    await message.reply(
                        `${bold("😄")} ${italic(joke)}`
                    );

                    return;
                }

            } catch (error) {
                console.error(
                    "[MESSAGE ERROR]",
                    error
                );
            }
        });

        await client.initialize();

    } catch (error) {
        status = "error";

        console.error(
            "[BOT START ERROR]",
            error
        );
    }
}

// HOME
app.get("/", (req, res) => {
    res.json({
        name: "MA BOT",
        status: status,
        uptime: runtime(),
        messages: messageCount
    });
});

// STATUS
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        status: status,
        uptime: runtime(),
        messages: messageCount
    });
});

// PAIRING CODE
app.post("/api/pair", async (req, res) => {
    try {
        if (!client) {
            return res.status(503).json({
                success: false,
                message: "WhatsApp client is not initialized yet."
            });
        }

        if (status !== "starting" && status !== "ready") {
            console.log(
                "Pairing request received. Current status:",
                status
            );
        }

        const phone = req.body.phone;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone required"
            });
        }

        let number = String(phone).replace(/\D/g, "");

        if (number.startsWith("0")) {
            number = "92" + number.substring(1);
        }

        console.log(
            "Requesting pairing code for:",
            number
        );

        const code =
            await client.requestPairingCode(
                number,
                true
            );

        return res.json({
            success: true,
            phone: number,
            pairingCode: code
        });

    } catch (error) {
        console.error(
            "[PAIR ERROR]",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `✅ MA BOT server running on port ${PORT}`
    );
});

// START BOT
startBot();
```
