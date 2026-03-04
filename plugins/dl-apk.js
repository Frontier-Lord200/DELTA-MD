const { malvin, fakevCard } = require("../malvin");
const axios = require('axios');

// APK storage for user sessions
const apkSessions = new Map();

const aptoide = {
    search: async function (query) {
        const response = await axios.get(
            `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=20`
        );
        
        if (!response.data.datalist || !response.data.datalist.list || response.data.datalist.list.length === 0) {
            return [];
        }

        return response.data.datalist.list.map((v) => {
            return {
                name: v.name,
                size: (v.size / (1024 * 1024)).toFixed(1) + ' MB',
                version: v.file?.vername || 'N/A',
                id: v.package,
                download: v.stats?.downloads || 0,
                icon: v.icon,
                developer: v.store?.name || 'Unknown'
            };
        });
    },

    download: async function (packageId) {
        const response = await axios.get(
            `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(packageId)}&limit=1`
        );

        if (!response.data.datalist || !response.data.datalist.list || response.data.datalist.list.length === 0) {
            throw new Error("Application not found.");
        }

        const app = response.data.datalist.list[0];

        return {
            img: app.icon,
            developer: app.store?.name || 'Unknown',
            appname: app.name,
            link: app.file?.path,
            size: (app.size / (1024 * 1024)).toFixed(1) + ' MB',
            version: app.file?.vername || 'N/A'
        };
    }
};

malvin({
    pattern: "apk",
    alias: ["apkdownload", "aptoide"],
    desc: "Download APK files from Aptoide",
    category: "download",
    react: "📱",
    use: ".apk <app-name> or .apk <number>",
    filename: __filename
}, async (malvin, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) {
            return reply(
                `📱 *APK Downloader*\n\n` +
                `*Usage:* .apk <app name>\n\n` +
                `*Examples:*\n` +
                `• .apk facebook lite\n` +
                `• .apk whatsapp\n` +
                `• .apk spotify\n\n` +
                `💡 After search, reply with .apk <number> to download\n\n` +
                `👤 *Requested by:* @${sender.split('@')[0]}`,
                { mentions: [sender] }
            );
        }

        const input = q.trim();

        // Check if user is selecting from previous search
        if (/^\d+$/.test(input) && apkSessions.has(sender)) {
            const session = apkSessions.get(sender);
            const index = parseInt(input) - 1;

            if (session.downloading) {
                return reply("⏳ You're already downloading an APK! Please wait...");
            }

            if (index < 0 || index >= session.results.length) {
                return reply(`❌ Invalid selection. Please choose a number between 1 and ${session.results.length}\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
            }

            const selectedApp = session.results[index];
            session.downloading = true;

            await malvin.sendMessage(from, { react: { text: '⏳', key: mek.key } });

            await reply(`📥 Downloading *${selectedApp.name}*...\nPlease wait, this may take a few minutes.`);

            try {
                const downloadData = await aptoide.download(selectedApp.id);

                // Send app info first
                await malvin.sendMessage(from, {
                    image: { url: downloadData.img },
                    caption: `📱 *${downloadData.appname}*\n\n` +
                            `👨‍💻 *Developer:* ${downloadData.developer}\n` +
                            `📦 *Version:* ${downloadData.version}\n` +
                            `💾 *Size:* ${downloadData.size}\n` +
                            `👤 *Requested by:* @${sender.split('@')[0]}\n\n` +
                            `⬬ Downloading APK file...`,
                    mentions: [sender]
                }, { quoted: fakevCard });

                // Download and send APK file
                const fileResponse = await axios.get(downloadData.link, {
                    responseType: 'arraybuffer',
                    timeout: 300000, // 5 minutes timeout
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                await malvin.sendMessage(from, {
                    document: Buffer.from(fileResponse.data),
                    fileName: `${downloadData.appname}.apk`,
                    mimetype: 'application/vnd.android.package-archive',
                    caption: `✅ *${downloadData.appname}* downloaded successfully!\n\n⚠️ *Note:* Install at your own risk. Always scan APK files before installation.\n\n👤 *Downloaded by:* @${sender.split('@')[0]}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ ᴛᴇᴄʜ`,
                    mentions: [sender]
                }, { quoted: fakevCard });

                await malvin.sendMessage(from, { react: { text: '✅', key: mek.key } });

            } catch (error) {
                console.error('APK Download error:', error);
                await reply(`❌ Failed to download APK: ${error.message}\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
                await malvin.sendMessage(from, { react: { text: '❌', key: mek.key } });
            } finally {
                session.downloading = false;
            }

        } else {
            // Search for APKs
            await malvin.sendMessage(from, { react: { text: '🔍', key: mek.key } });

            await reply(`🔍 Searching for *${input}*...`);

            const searchResults = await aptoide.search(input);

            if (!searchResults || searchResults.length === 0) {
                await malvin.sendMessage(from, { react: { text: '❌', key: mek.key } });
                return reply(`❌ No results found for "*${input}*".\n\nTry different keywords or check spelling.\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
            }

            const resultsList = searchResults.slice(0, 10).map((app, i) => {
                return `${i + 1}. *${app.name}*\n` +
                       `📦 *Size:* ${app.size}\n` +
                       `🔢 *Version:* ${app.version}\n` +
                       `⬇️ *Downloads:* ${app.download.toLocaleString()}\n` +
                       `👨‍💻 *Developer:* ${app.developer}`;
            }).join('\n\n');

            const caption = `📱 *APK Search Results*\n\n${resultsList}\n\n` +
                           `💡 *To download:* Reply with .apk <number>\n` +
                           `*Example:* .apk 1\n\n` +
                           `👤 *Requested by:* @${sender.split('@')[0]}\n\n` +
                           `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ ᴛᴇᴄʜ`;

            await malvin.sendMessage(from, {
                text: caption,
                mentions: [sender]
            }, { quoted: fakevCard });

            // Store search results for user
            apkSessions.set(sender, {
                results: searchResults,
                downloading: false,
                timestamp: Date.now()
            });

            // Auto-cleanup after 1 hour
            setTimeout(() => {
                apkSessions.delete(sender);
            }, 3600000);

            await malvin.sendMessage(from, { react: { text: '✅', key: mek.key } });
        }

    } catch (error) {
        console.error('APK command error:', error);
        await malvin.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`❌ An error occurred: ${error.message}\n\n👤 *Requested by:* @${sender.split('@')[0]}`, { mentions: [sender] });
    }
});