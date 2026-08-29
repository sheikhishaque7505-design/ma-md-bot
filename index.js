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
    const days = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return days > 0 ? `${days}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
}

async function startBot() {
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

    client.on("authenticated", () => {
        status = "authenticated";
        console.log("✓ Authenticated");
    });

    client.on("auth_failure", (msg) => {
        status = "auth_failure";
        console.log("❌ Auth failed:", msg);
    });

    client.on("disconnected", (reason) => {
        status = "disconnected";
        console.log("⚠️ Disconnected:", reason);
        
        if (reason !== "LOGOUT") {
            setTimeout(() => {
                startBot().catch(err => console.error(err.message));
            }, 5000);
        }
    });

    client.on("message", async (message) => {
        try {
            const rawText = message.body || "";
            const text = rawText.trim().toLowerCase();
            messageCount++;
            console.log(`[MSG ${messageCount}] ${rawText}`);

            // TEST
            if (text === ".test") {
                await message.reply(
                    `${bold('✅ Bot working!')}\n${line()}\n` +
                    `⏱️ Uptime: ${runtime()}\n` +
                    `💬 Messages: ${messageCount}`
                );
                return;
            }

            // MENU
            if (text === ".menu" || text === ".help") {
                await message.reply(
                    `${doubleLine()}\n` +
                    `${bold('🤖 MA BOT MENU')}\n` +
                    `${doubleLine()}\n\n` +
                    `${bold('📌 GENERAL')}\n${line()}\n` +
                    `${mono('.ping')} - Check bot\n` +
                    `${mono('.alive')} - Bot status\n` +
                    `${mono('.info')} - Bot info\n` +
                    `${mono('.runtime')} - Uptime\n` +
                    `${mono('.owner')} - Owner info\n` +
                    `${mono('.stats')} - Statistics\n\n` +
                    `${bold('👥 GROUP')}\n${line()}\n` +
                    `${mono('.groupinfo')} - Group details\n` +
                    `${mono('.admins')} - List admins\n` +
                    `${mono('.members')} - Member count\n` +
                    `${mono('.tagall')} - Tag everyone\n` +
                    `${mono('.hidetag')} - Hidden tag\n` +
                    `${mono('.kick')} - Remove member\n` +
                    `${mono('.add')} - Add member\n` +
                    `${mono('.promote')} - Make admin\n` +
                    `${mono('.demote')} - Remove admin\n` +
                    `${mono('.mute')} - Mute group\n` +
                    `${mono('.unmute')} - Unmute group\n\n` +
                    `${bold('🛠️ TOOLS')}\n${line()}\n` +
                    `${mono('.sticker')} - Create sticker\n` +
                    `${mono('.calc')} - Calculator\n` +
                    `${mono('.coinflip')} - Flip coin\n` +
                    `${mono('.dice')} - Roll dice\n` +
                    `${mono('.8ball')} - Magic ball\n` +
                    `${mono('.joke')} - Random joke\n` +
                    `${mono('.fact')} - Random fact\n` +
                    `${mono('.quote')} - Random quote\n` +
                    `${mono('.reverse')} - Reverse text\n` +
                    `${mono('.uppercase')} - UPPERCASE\n` +
                    `${mono('.lowercase')} - lowercase\n` +
                    `${mono('.length')} - Text length\n\n` +
                    `${bold('👑 OWNER')}\n${line()}\n` +
                    `${mono('.logout')} - Logout bot\n\n` +
                    `${doubleLine()}\n` +
                    `${italic('MA Developers - 24/7 Bot')}\n` +
                    `${doubleLine()}`
                );
                return;
            }

            // PING
            if (text === ".ping") {
                await message.reply(
                    `${bold('🏓 Pong!')}\n${italic('Bot online 24/7')}`
                );
                return;
            }

            // ALIVE
            if (text === ".alive") {
                await message.reply(
                    `${doubleLine()}\n` +
                    `${bold('✅ BOT STATUS')}\n` +
                    `${doubleLine()}\n\n` +
                    `📊 ${bold('Status:')} Online\n` +
                    `⏱️ ${bold('Uptime:')} ${mono(runtime())}\n` +
                    `💬 ${bold('Messages:')} ${messageCount}\n` +
                    `🔋 ${bold('Health:')} Excellent\n\n` +
                    `${doubleLine()}`
                );
                return;
            }

            // INFO
            if (text === ".info") {
                const info = client.info;
                await message.reply(
                    `${bold('📱 Bot Info')}\n${line()}\n` +
                    `👤 ${info?.pushname || 'MA BOT'}\n` +
                    `📞 ${mono(info?.wid?.user || 'Unknown')}\n` +
                    `⏱️ ${runtime()}\n` +
                    `💬 ${messageCount} messages`
                );
                return;
            }

            // RUNTIME
            if (text === ".runtime") {
                await message.reply(
                    `${bold('⏱️ Uptime:')} ${mono(runtime())}`
                );
                return;
            }

            // OWNER
            if (text === ".owner") {
                await message.reply(
                    `${doubleLine()}\n` +
                    `${bold('👑 MA BOT OWNER INFO')}\n` +
                    `${doubleLine()}\n\n` +
                    `${bold('OWNER INFORMATION')}\n${line()}\n` +
                    `👤 ${bold('Name:')} Muhammad Ayan\n` +
                    `🏢 ${bold('Developer:')} MA Developers\n` +
                    `💻 ${bold('Role:')} Founder & Developer\n` +
                    `🤖 ${bold('Bot Name:')} MA BOT\n` +
                    `⚡ ${bold('Bot Status:')} Active\n` +
                    `🔧 ${bold('Version:')} Latest\n` +
                    `📱 ${bold('Platform:')} WhatsApp\n\n` +
                    `${bold('🌟 ABOUT THE OWNER')}\n${line()}\n` +
                    `${italic('Muhammad Ayan is the Founder and Developer of MA Developers. This bot is developed and managed under MA Developers with regular updates, new features, improved performance, and advanced command management.')}\n\n` +
                    `${bold('📌 MA DEVELOPERS')}\n${line()}\n` +
                    `${italic('MA Developers focuses on development, technology, web solutions, and digital projects with modern and innovative ideas.')}\n\n` +
                    `${bold('💡 BOT COMMANDS')}\n${line()}\n` +
                    `${mono('.menu')} - View all commands\n` +
                    `${mono('.ping')} - Check bot response\n\n` +
                    `${doubleLine()}\n` +
                    `${italic('© MA Developers')}\n` +
                    `${italic('Owner: Muhammad Ayan')}\n` +
                    `${italic('All Rights Reserved')}\n` +
                    `${doubleLine()}`
                );
                return;
            }

            // STATS
            if (text === ".stats") {
                await message.reply(
                    `${bold('📊 Stats')}\n${line()}\n` +
                    `💬 Messages: ${messageCount}\n` +
                    `⏱️ Uptime: ${runtime()}\n` +
                    `📊 Status: ${status}`
                );
                return;
            }

            // GROUP INFO
            if (text === ".groupinfo") {
                if (!message.from.endsWith("@g.us")) {
                    await message.reply(bold('❌ Group only!'));
                    return;
                }
                const chat = await message.getChat();
                await message.reply(
                    `${bold('👥 Group Info')}\n${line()}\n` +
                    `📛 ${chat.name}\n` +
                    `👤 ${chat.participants.length} members`
                );
                return;
            }

            // ADMINS
            if (text === ".admins") {
                if (!message.from.endsWith("@g.us")) {
                    await message.reply(bold('❌ Group only!'));
                    return;
                }
                const chat = await message.getChat();
                const admins = chat.participants.filter(p => p.isAdmin);
                let output = `${bold('👑 Admins')}\n${line()}\n`;
                admins.forEach((admin, i) => {
                    output += `${i + 1}. @${admin.id.user}\n`;
                });
                await message.reply(output, undefined, {
                    mentions: admins.map(a => a.id._serialized)
                });
                return;
            }

            // MEMBERS
            if (text === ".members") {
                if (!message.from.endsWith("@g.us")) {
                    await message.reply(bold('❌ Group only!'));
                    return;
                }
                const chat = await message.getChat();
                await message.reply(
                    `${bold('👥 Members:')} ${chat.participants.length}`
                );
                return;
            }

            // TAGALL
            if (text === ".tagall") {
                if (!message.from.endsWith("@g.us")) {
                    await message.reply(bold('❌ Group only!'));
                    return;
                }
                const chat = await message.getChat();
                const mentions = chat.participants;
                let textOut = `${bold('📢 Attention')}\n\n`;
                mentions.forEach(p => {
                    textOut += `@${p.id.user} `;
                });
                await message.reply(textOut, undefined, {
                    mentions: mentions.map(p => p.id._serialized)
                });
                return;
            }

            // HIDETAG
            if (text === ".hidetag") {
                if (!message.from.endsWith("@g.us")) return;
                const chat = await message.getChat();
                const mentions = chat.participants;
                await message.reply(
                    `${bold('📢 Announcement')}`,
                    undefined,
                    { mentions: mentions.map(p => p.id._serialized) }
                );
                return;
            }

            // KICK
            if (text.startsWith(".kick")) {
                if (!message.from.endsWith("@g.us")) return;
                const mentions = await message.getMentions();
                if (!mentions.length) {
                    await message.reply(bold('⚠️ Tag member'));
                    return;
                }
                const chat = await message.getChat();
                await chat.removeParticipants(mentions.map(m => m.id._serialized));
                await message.reply(bold('✅ Removed!'));
                return;
            }

            // ADD
            if (text.startsWith(".add")) {
                if (!message.from.endsWith("@g.us")) return;
                const number = rawText.split(" ").slice(1).join("").replace(/\D/g, "");
                if (!number) {
                    await message.reply(`${bold('ℹ️ Usage:')} .add 923001234567`);
                    return;
                }
                const chat = await message.getChat();
                await chat.addParticipants([`${number}@c.us`]);
                await message.reply(bold('✅ Added!'));
                return;
            }

            // PROMOTE
            if (text === ".promote") {
                if (!message.from.endsWith("@g.us")) return;
                const mentions = await message.getMentions();
                if (!mentions.length) return;
                const chat = await message.getChat();
                await chat.promoteParticipants(mentions.map(m => m.id._serialized));
                await message.reply(bold('✅ Promoted!'));
                return;
            }

            // DEMOTE
            if (text === ".demote") {
                if (!message.from.endsWith("@g.us")) return;
                const mentions = await message.getMentions();
                if (!mentions.length) return;
                const chat = await message.getChat();
                await chat.demoteParticipants(mentions.map(m => m.id._serialized));
                await message.reply(bold('✅ Demoted!'));
                return;
            }

            // MUTE
            if (text === ".mute") {
                if (!message.from.endsWith("@g.us")) return;
                const chat = await message.getChat();
                await chat.setMessagesAdminsOnly(true);
                await message.reply(bold('🔒 Muted!'));
                return;
            }

            // UNMUTE
            if (text === ".unmute") {
                if (!message.from.endsWith("@g.us")) return;
                const chat = await message.getChat();
                await chat.setMessagesAdminsOnly(false);
                await message.reply(bold('🔓 Unmuted!'));
                return;
            }

            // STICKER
            if (text === ".sticker") {
                if (!message.hasMedia) {
                    await message.reply(`${bold('ℹ️ Send image with caption')} .sticker`);
                    return;
                }
                const media = await message.downloadMedia();
                if (!media) return;
                await client.sendMessage(
                    message.from,
                    new MessageMedia(media.mimetype, media.data, "MA-BOT"),
                    { sendMediaAsSticker: true }
                );
                return;
            }

            // CALCULATOR
            if (text.startsWith(".calc")) {
                const expression = rawText.substring(5).trim();
                if (!expression) {
                    await message.reply(`${bold('ℹ️ Usage:')} .calc 25+25`);
                    return;
                }
                try {
                    const result = Function(`"use strict"; return (${expression})`)();
                    await message.reply(`${bold('🧮')} ${mono(result.toString())}`);
                } catch {
                    await message.reply(bold('❌ Error'));
                }
                return;
            }

            // COINFLIP
            if (text === ".coinflip") {
                const result = Math.random() < 0.5 ? "Heads" : "Tails";
                await message.reply(`${bold('🪙 ' + result)}!`);
                return;
            }

            // DICE
            if (text === ".dice") {
                const result = Math.floor(Math.random() * 6) + 1;
                await message.reply(`${bold('🎲 ' + result)}`);
                return;
            }

            // 8BALL
            if (text.startsWith(".8ball")) {
                const answers = ["Yes!", "No!", "Maybe...", "Definitely!", "Ask again later."];
                const answer = answers[Math.floor(Math.random() * answers.length)];
                await message.reply(`${bold('🎱 ' + answer)}`);
                return;
            }

            // JOKE
            if (text === ".joke") {
                const jokes = [
                    "Why did the developer go broke? Cache problems!",
                    "Programmer's favorite place: Foo Bar",
                    "Why hate nature? Too many bugs!"
                ];
                await message.reply(`${bold('😄')} ${italic(jokes[Math.floor(Math.random() * jokes.length)])}`);
                return;
            }

            // FACT
            if (text === ".fact") {
                const facts = [
                    "JavaScript was created in 1995.",
                    "The first mouse was made of wood.",
                    "HTML is not a programming language."
                ];
                await message.reply(`${bold('💡')} ${italic(facts[Math.floor(Math.random() * facts.length)])}`);
                return;
            }

            // QUOTE
            if (text === ".quote") {
                const quotes = [
                    "Stay focused and keep building.",
                    "Great software starts simple.",
                    "Consistency beats intensity."
                ];
                await message.reply(`${bold('💬')} ${italic('"' + quotes[Math.floor(Math.random() * quotes.length)] + '"')}`);
                return;
            }

            // REVERSE
            if (text.startsWith(".reverse")) {
                const value = rawText.substring(8).trim();
                if (!value) return;
                await message.reply(mono(value.split("").reverse().join("")));
                return;
            }

            // UPPERCASE
            if (text.startsWith(".uppercase")) {
                const value = rawText.substring(10).trim();
                if (!value) return;
                await message.reply(mono(value.toUpperCase()));
                return;
            }

            // LOWERCASE
            if (text.startsWith(".lowercase")) {
                const value = rawText.substring(10).trim();
                if (!value) return;
                await message.reply(mono(value.toLowerCase()));
                return;
            }

            // LENGTH
            if (text.startsWith(".length")) {
                const value = rawText.substring(7).trim();
                if (!value) return;
                await message.reply(`${bold('📏')} ${value.length}`);
                return;
            }

            // LOGOUT
            if (text === ".logout") {
                const contact = await message.getContact();
                if (!client.info || contact.id.user !== client.info.wid.user) {
                    await message.reply(bold('❌ Owner only!'));
                    return;
                }
                await message.reply(bold('👋 Logging out...'));
                setTimeout(async () => {
                    try {
                        await client.logout();
                    } catch (e) {
                        await client.destroy();
                    }
                }, 1000);
                return;
            }

        } catch (error) {
            console.error("[ERROR]", error.message);
        }
    });

    await client.initialize();
}

// HTTP Server
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>MA BOT</title>
<style>
body { font-family: Arial; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.card { background: #1e293b; padding: 40px; border-radius: 20px; text-align: center; }
input { padding: 12px; border-radius: 8px; border: none; margin: 10px; width: 250px; }
button { padding: 12px 30px; border-radius: 8px; border: none; background: #3b82f6; color: white; cursor: pointer; font-weight: bold; }
.code { font-size: 32px; font-weight: bold; margin-top: 20px; color: #60a5fa; letter-spacing: 5px; }
</style>
</head>
<body>
<div class="card">
<h1>🤖 MA BOT</h1>
<p>WhatsApp Bot</p>
<input id="phone" placeholder="923001234567" />
<button onclick="pair()">Get Pairing Code</button>
<div class="code" id="code"></div>
</div>
<script>
async function pair() {
    const phone = document.getElementById('phone').value;
    const res = await fetch('/api/pair', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({phone})
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('code').textContent = data.pairingCode;
    } else {
        alert(data.message);
    }
}
</script>
</body>
</html>
    `);
});

app.get("/api/status", (req, res) => {
    res.json({ status, messageCount, runtime: runtime() });
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
